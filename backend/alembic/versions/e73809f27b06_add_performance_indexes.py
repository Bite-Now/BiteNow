"""add_performance_indexes

Revision ID: e73809f27b06
Revises: 99d490a29203
Create Date: 2026-06-19 18:04:34.275665

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e73809f27b06'
down_revision: Union[str, Sequence[str], None] = '99d490a29203'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # orders
    op.create_index('ix_orders_student_id', 'orders', ['student_id'])
    op.create_index('ix_orders_canteen_id', 'orders', ['canteen_id'])
    op.create_index('ix_orders_status', 'orders', ['status'])
    # menu_items
    op.create_index('ix_menu_items_canteen_id', 'menu_items', ['canteen_id'])
    op.create_index('ix_menu_items_category', 'menu_items', ['category'])
    op.create_index('ix_menu_items_is_available', 'menu_items', ['is_available'])
    # order_items
    op.create_index('ix_order_items_order_id', 'order_items', ['order_id'])
    # canteens
    op.create_index('ix_canteens_owner_id', 'canteens', ['owner_id'])
    # staff_assignments
    op.create_index('ix_staff_assignments_canteen_id', 'staff_assignments', ['canteen_id'])
    # notifications
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])

def downgrade() -> None:
    op.drop_index('ix_notifications_is_read', table_name='notifications')
    op.drop_index('ix_notifications_user_id', table_name='notifications')
    op.drop_index('ix_staff_assignments_canteen_id', table_name='staff_assignments')
    op.drop_index('ix_canteens_owner_id', table_name='canteens')
    op.drop_index('ix_order_items_order_id', table_name='order_items')
    op.drop_index('ix_menu_items_is_available', table_name='menu_items')
    op.drop_index('ix_menu_items_category', table_name='menu_items')
    op.drop_index('ix_menu_items_canteen_id', table_name='menu_items')
    op.drop_index('ix_orders_status', table_name='orders')
    op.drop_index('ix_orders_canteen_id', table_name='orders')
    op.drop_index('ix_orders_student_id', table_name='orders')
