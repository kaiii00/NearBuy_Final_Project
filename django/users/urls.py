from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health),
    path('notifications/', views.get_notifications),
    path('notifications/create/', views.create_notification),
    path('notifications/read-all/', views.mark_all_read),
    path('notifications/<int:pk>/read/', views.mark_read),
    path('notifications/unread-count/', views.unread_count),
]