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
        completed_statuses = ['READY', 'COMPLETED', 'COLLECTED']
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

        # 5. Trend Chart Data - Monthly (Last 7 days)
        # Note: We simulate "Monthly" as daily data for the current month/last 7 days to match UI trends
        today = datetime.now()
        monthly_data = []
        for i in range(6, -1, -1):
            target_date = today - timedelta(days=i)
            start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            stmt_day = select(
                func.sum(Order.total_amount).label('earnings'),
                func.count(Order.id).label('orders')
            ).where(
                Order.canteen_id == canteen_id,
                Order.status.in_(completed_statuses),
                Order.created_at >= start_of_day,
                Order.created_at <= end_of_day
            )
            res_day = await self.db.execute(stmt_day)
            day_row = res_day.first()
            
            monthly_data.append({
                "name": target_date.strftime("%a"), # e.g. Mon, Tue
                "earnings": float(day_row.earnings or 0),
                "orders": day_row.orders or 0
            })

        # 6. Trend Chart Data - Yearly (Last 6 months)
        yearly_data = []
        for i in range(5, -1, -1):
            target_month = today - relativedelta(months=i)
            start_of_month = target_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            _, last_day = calendar.monthrange(target_month.year, target_month.month)
            end_of_month = target_month.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)
            
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
            
            yearly_data.append({
                "name": target_month.strftime("%b"), # e.g. Jan, Feb
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
            "yearly_data": yearly_data
        }

from fastapi import Depends
from app.core.database import get_db

def get_analytics_service(db: AsyncSession = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(db)
