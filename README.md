# MailerWeb - Room Booking System

Um sistema Full-Stack robusto para agendamento de salas de reunião. Este projeto foi desenvolvido com foco em resiliência, consistência de dados e Experiência do Usuário.

## Principais Funcionalidades

- **CRUD Completo de Reservas**: Criar, listar, editar e cancelar reservas de salas.
- **Proteção Contra Conflitos**: Bloqueio em nível de Banco de Dados garantindo que duas pessoas não consigam reservar a mesma sala no mesmo horário.
- **Mensageria Resiliente**: Envio de notificações assíncronas (via Celery/Redis) utilizando o *Transactional Outbox Pattern* para garantir a entrega sem duplicidade.
- **Autenticação JWT**: Sistema de login e registro seguro e reativo.
- **Interface Moderna**: SPA rápida com atualização em tempo real (Cache Invalidation) e tratamento de erros amigável.

---

## Stack Tecnológica

**Backend:**
- Python 3.11 + Django + Django REST Framework
- PostgreSQL 15 (com extensão `btree_gist` para Exclusion Constraints)
- Redis + Celery (Workers assíncronos)
- Pytest (TDD e testes de integração)
- Swagger / OpenAPI (DRF Spectacular)

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- React Query (TanStack Query) + Axios
- React Hook Form + Zod (Validações estritas)
- Lucide React (Ícones)

**Infraestrutura:**
- Docker & Docker Compose (Orquestração completa)

**Decisões Arquiteturais:** Para um mergulho profundo nas escolhas técnicas, design patterns e arquitetura, consulte os documentos detalhados:
- [Arquitetura do Backend](./backend/ARCHITECTURE.md)
- [Arquitetura do Frontend](./frontend/ARCHITECTURE.md)

---

## Como Rodar o Projeto

Você precisa apenas do **Docker** e **Docker Compose** instalados na sua máquina.

### 1. Clone e suba os containers
No terminal, na raiz do projeto, execute:
```bash
docker-compose up -d --build
```
Isso irá construir as imagens, subir o Banco, o Redis, a API, o Worker e o Frontend, além de rodar as migrações automaticamente.

### 2. Cadastrando as Salas
Para facilitar os testes, o projeto conta com um script automatizado que popula o banco de dados com salas iniciais. No terminal, execute:
```bash
docker-compose exec backend python manage.py seed_rooms
```
Se desejar acessar o painel administrativo do Django para gerenciar os dados manualmente, crie um superusuário:
```
docker-compose exec backend python manage.py createsuperuser
```

### 3. Acessando a Aplicação
- Frontend (App Web): http://localhost:5173
- Documentação da API (Swagger): http://localhost:8000/api/docs/
- Backend API Base URL: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

---
## Como Rodar os Testes
O backend possui uma suíte de testes garantindo as regras de negócio.
- Para rodar os testes do backend, execute:
```
docker-compose exec backend pytest -v
```
- Para rodar os testes do frontend, execute:
```
docker-compose exec frontend npm run test
```

---

## Autor
Desenvolvido por Diego Olinek.