from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Booking
from .serializers import BookingSerializer
from .services import BookingService


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-start_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            booking = BookingService.create_booking(
                user=request.user,
                room=serializer.validated_data['room'],
                title=serializer.validated_data['title'],
                start_at=serializer.validated_data['start_at'],
                end_at=serializer.validated_data['end_at']
            )
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({'error': str(e.message) if hasattr(e, 'message') else e.messages}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        serializer = self.get_serializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            title = serializer.validated_data.get('title', booking.title)
            start_at = serializer.validated_data.get('start_at', booking.start_at)
            end_at = serializer.validated_data.get('end_at', booking.end_at)

            updated_booking = BookingService.update_booking(booking, title, start_at, end_at)
            return Response(BookingSerializer(updated_booking).data)
        except DjangoValidationError as e:
            return Response({'error': str(e.message) if hasattr(e, 'message') else e.messages}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == Booking.Status.CANCELED:
            return Response({'error': 'Booking is already canceled.'}, status=status.HTTP_400_BAD_REQUEST)
        
        canceled_booking = BookingService.cancel_booking(booking)
        return Response(BookingSerializer(canceled_booking).data)
