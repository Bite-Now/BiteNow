import calendar
from datetime import datetime, date, timedelta
from uuid import UUID
from typing import List, Dict, Any

from sqlalchemy import select, func, case, extract, desc
from sqlalchemy.ext.asyncio import AsyncSession
from dateutil.relativedelta import relativedelta

from app.modules.orders.models import Order, OrderItem
from app.modules.menu.models import MenuItem

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_vendor_dashboard_stats(self, canteen_id: UUID) -> Dict[str, Any]:
        # 1. Total Earnings & Orders Completed
        completed_statuses = ['COMPLETED', 'COLLECTED']
        stmt_earnings = select(
            func.sum(Order.total_amount).label('total_earnings'),
            func.count(Order.id).label('orders_completed')
        ).where(
            Order.canteen_id == canteen_id,
            Order.status.in_(completed_statuses)
        )
        res_earnings = await self.db.execute(stmt_earnings)
        earnings_row = res_earnings.first()
        
        total_earnings = earnings_row.total_earnings or 0
        orders_completed = earnings_row.orders_completed or 0

        # 2. Orders Pending
        pending_statuses = ['PAID', 'PREPARING']
        stmt_pending = select(func.count(Order.id)).where(
            Order.canteen_id == canteen_id,
            Order.status.in_(pending_statuses)
        )
        res_pending = await self.db.execute(stmt_pending)
        orders_pending = res_pending.scalar() or 0

        # 3. Batching Efficiency 
        # Calculated as: (orders_completed / (orders_completed + failed_orders)) * 100
        stmt_total_finished = select(func.count(Order.id)).where(
            Order.canteen_id == canteen_id,
            Order.status.in_(completed_statuses + ['CANCELLED', 'FAILED', 'REFUNDED'])
        )
        res_total_finished = await self.db.execute(stmt_total_finished)
        total_finished = res_total_finished.scalar() or 0
        
        batching_efficiency = "100%"
        if total_finished > 0:
            eff = (orders_completed / total_finished) * 100
            batching_efficiency = f"{int(eff)}%"
        elif orders_completed == 0 and orders_pending == 0:
            batching_efficiency = "0%"

        # 4. Top Moving Items
        stmt_top_items = select(
            MenuItem.name,
            func.sum(OrderItem.quantity).label('total_sold')
        ).select_from(
            Order
        ).join(
            OrderItem, Order.id == OrderItem.order_id
        ).join(
            MenuItem, OrderItem.menu_item_id == MenuItem.id
        ).where(
            Order.canteen_id == canteen_id,
            Order.status.in_(completed_statuses)
        ).group_by(
            MenuItem.name
        ).order_by(
            desc('total_sold')
        ).limit(5)
        
        res_top_items = await self.db.execute(stmt_top_items)
        top_items = [
            {"name": row.name, "orders": int(row.total_sold)} 
            for row in res_top_items.all()
        ]

        # 5. Trend Chart Data - Weekly (4 weeks of the current month)
        today = datetime.now()
        weekly_data = []
        
        # Define week boundaries: 1-7, 8-14, 15-21, 22-end
        _, last_day = calendar.monthrange(today.year, today.month)
        week_ranges = [
            (1, 7, "Week 1"),
            (8, 14, "Week 2"),
            (15, 21, "Week 3"),
            (22, last_day, "Week 4")
        ]
        
        for start_d, end_d, week_name in week_ranges:
            start_of_week = today.replace(day=start_d, hour=0, minute=0, second=0, microsecond=0)
            end_of_week = today.replace(day=end_d, hour=23, minute=59, second=59, microsecond=999999)
            
            stmt_week = select(
                func.sum(Order.total_amount).label('earnings'),
                func.count(Order.id).label('orders')
            ).where(
                Order.canteen_id == canteen_id,
                Order.status.in_(completed_statuses),
                Order.created_at >= start_of_week,
                Order.created_at <= end_of_week
            )
            res_week = await self.db.execute(stmt_week)
            week_row = res_week.first()
            
            weekly_data.append({
                "name": week_name,
                "earnings": float(week_row.earnings or 0),
                "orders": week_row.orders or 0
            })

        # 6. Trend Chart Data - Monthly (Jan to Dec of current year)
        monthly_data = []
        for month in range(1, 13):
            start_of_month = today.replace(month=month, day=1, hour=0, minute=0, second=0, microsecond=0)
            _, month_last_day = calendar.monthrange(today.year, month)
            end_of_month = today.replace(month=month, day=month_last_day, hour=23, minute=59, second=59, microsecond=999999)
            
            stmt_month = select(
                func.sum(Order.total_amount).label('earnings'),
                func.count(Order.id).label('orders')
            ).where(
                Order.canteen_id == canteen_id,
                Order.status.in_(completed_statuses),
                Order.created_at >= start_of_month,
                Order.created_at <= end_of_month
            )
            res_month = await self.db.execute(stmt_month)
            month_row = res_month.first()
            
            monthly_data.append({
                "name": start_of_month.strftime("%b"), # Jan, Feb, etc.
                "earnings": float(month_row.earnings or 0),
                "orders": month_row.orders or 0
            })

        return {
            "earnings": f"₹{total_earnings:,.0f}",
            "orders_completed": orders_completed,
            "orders_pending": orders_pending,
            "batching_efficiency": batching_efficiency,
            "top_items": top_items,
            "monthly_data": monthly_data,
            "weekly_data": weekly_data
        }

from fastapi import Depends
from app.core.database import get_db

def get_analytics_service(db: AsyncSession = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(db)
