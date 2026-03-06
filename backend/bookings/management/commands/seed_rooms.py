from django.core.management.base import BaseCommand
from rooms.models import Room

class Command(BaseCommand):
    help = 'Popula o banco de dados com salas de reunião iniciais (Seed)'

    def handle(self, *args, **kwargs):
        salas_iniciais = [
            {'name': 'Sala 101', 'capacity': 10},
            {'name': 'Sala 201', 'capacity': 4},
            {'name': 'Sala 301', 'capacity': 20},
        ]

        self.stdout.write('Iniciando o seed de salas...')

        count = 0
        for sala_data in salas_iniciais:
            room, created = Room.objects.get_or_create(
                name=sala_data['name'],
                defaults={'capacity': sala_data['capacity']}
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Sala "{room.name}" criada com sucesso!'))
                count += 1
            else:
                self.stdout.write(self.style.WARNING(f'Sala "{room.name}" já existe no banco. Pulando.'))

        self.stdout.write(self.style.SUCCESS(f'Seed finalizado! {count} novas salas adicionadas.'))
