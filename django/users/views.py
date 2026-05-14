from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Notification


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({'status': 'Django content API is running.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_notifications(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required'}, status=400)
    notifications = Notification.objects.filter(user_id=user_id)
    data = [{
        'id': n.id,
        'type': n.type,
        'title': n.title,
        'message': n.message,
        'order_id': n.order_id,
        'is_read': n.is_read,
        'created_at': n.created_at,
    } for n in notifications]
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def create_notification(request):
    data = request.data
    n = Notification.objects.create(
        user_id=data.get('user_id'),
        type=data.get('type', 'general'),
        title=data.get('title'),
        message=data.get('message'),
        order_id=data.get('order_id'),
    )
    return Response({'id': n.id, 'message': 'Notification created'}, status=201)


@api_view(['PATCH'])
@permission_classes([AllowAny])
def mark_read(request, pk):
    try:
        n = Notification.objects.get(pk=pk)
        n.is_read = True
        n.save()
        return Response({'success': True})
    except Notification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)


@api_view(['PATCH'])
@permission_classes([AllowAny])
def mark_all_read(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required'}, status=400)
    Notification.objects.filter(user_id=user_id, is_read=False).update(is_read=True)
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([AllowAny])
def unread_count(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({'error': 'user_id is required'}, status=400)
    count = Notification.objects.filter(user_id=user_id, is_read=False).count()
    return Response({'count': count})