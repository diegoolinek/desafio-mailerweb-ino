import logging
from celery import shared_task
from django.core.mail import send_mail
from django.db import transaction
from notifications.models import OutboxEvent

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def process_outbox_event(self, event_id):
    try:
        with transaction.atomic():
            event = OutboxEvent.objects.select_for_update(nowait=True).get(id=event_id)

            if event.status != OutboxEvent.Status.PENDING:
                logger.info(f"Evento {event_id} já processado ou falhou anteriormente.")
                return

            payload = event.payload
            subject = f"[{event.event_type}] Notificação de Reserva: {payload.get('title')}"
            message = f"""
            Reunião: {payload.get('title')}
            Sala: {payload.get('room')}
            Início: {payload.get('start_at')}
            Fim: {payload.get('end_at')}
            Ação: {event.event_type}
            """

            send_mail(
                subject=subject,
                message=message,
                from_email='noreply@mailerweb.com',
                recipient_list=[payload.get('user_email')],
                fail_silently=False,
            )

            event.status = OutboxEvent.Status.PROCESSED
            event.save()
            logger.info(f"E-mail enviado e evento {event_id} concluído com sucesso!")

    except OutboxEvent.DoesNotExist:
        logger.error(f"Evento {event_id} não encontrado.")
    except Exception as exc:
        event = OutboxEvent.objects.get(id=event_id)
        event.attempts += 1
        
        if self.request.retries >= self.max_retries:
            event.status = OutboxEvent.Status.FAILED
            logger.error(f"Evento {event_id} falhou definitivamente após {event.attempts} tentativas.")
        else:
            logger.warning(f"Erro ao processar evento {event_id}. Tentando novamente... Erro: {exc}")
            
        event.save()
        
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
