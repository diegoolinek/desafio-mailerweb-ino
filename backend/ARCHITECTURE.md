# Arquitetura e Decisões Técnicas do Backend

Este documento detalha as principais decisões arquiteturais tomadas durante o desenvolvimento da API de reservas de salas (Booking System), focando em resiliência, consistência de dados e boas práticas de engenharia de software.

## 1. Stack Tecnológica
- **Framework:** Django + Django REST Framework (DRF)
- **Banco de Dados:** PostgreSQL 15
- **Fila/Mensageria:** Redis + Celery
- **Testes:** Pytest + Pytest-Django
- **Documentação:** DRF Spectacular (Swagger/OpenAPI)
- **Infraestrutura:** Docker + Docker Compose

---

## 2. Tratamento de Concorrência e Conflito de Horários
O maior desafio de um sistema de reservas é garantir que duas pessoas não consigam reservar a mesma sala no mesmo horário exato (Race Condition). 

**A Decisão:** Em vez de usar *locks* na aplicação (o que pode falhar em ambientes distribuídos) ou validações complexas no Python que abrem brechas para race condition, deleguei essa responsabilidade matematicamente para o motor do banco de dados.
- **Como foi feito:** Utilizei uma `ExclusionConstraint` do PostgreSQL aliada à extensão `btree_gist` e ao tipo de dado `tstzrange` (Time Stamp Time Zone Range).
- **O Resultado:** O próprio banco de dados bloqueia a inserção de registros cujos intervalos de tempo (`start_at` e `end_at`) se sobreponham (`OVERLAPS`) para a mesma sala (`room_id`), desde que a reserva esteja com status `ACTIVE`. Isso garante 100% de consistência sem onerar a aplicação.

---

## 3. Padrão de Projeto: Service Layer (Camada de Serviço)
Para manter as *Views* (controladores) limpas e focadas apenas em tratar requisições HTTP (Request/Response), extraí toda a regra de negócio para uma camada de Serviços (`BookingService`).

**A Decisão:** Centralizar a lógica de negócio.
- **Como foi feito:** Validações de duração mínima (15 minutos), máxima (8 horas) e tratamento do `IntegrityError` (quando o banco recusa a inserção por conflito de horário) ocorrem exclusivamente no serviço.
- **O Resultado:** O código fica mais testável, reutilizável (podemos chamar o serviço por um comando de terminal ou rotina em background, não apenas via API) e as Views ficam extremamente enxutas.

---

## 4. Mensageria Resiliente: Padrão Outbox + Celery
O requisito exigia o envio assíncrono de notificações por e-mail, mas o envio de e-mails pode falhar devido a instabilidades de rede ou do provedor SMTP.

**A Decisão:** Implementar o **Transactional Outbox Pattern**.
- **O Problema evitado:** Se salvássemos a reserva no banco e enviássemos a tarefa para o Redis logo em seguida, o Celery poderia tentar enviar o e-mail antes da transação do banco finalizar, ou a API poderia cair após salvar no banco e antes de enviar para o Redis (perdendo o e-mail para sempre).
- **Como foi feito:** 1. Abrimos uma `transaction.atomic()` no banco de dados.
  2. Salvamos a reserva (`Booking`).
  3. Na **mesma transação**, salvamos um registro na tabela `OutboxEvent` com o status `PENDING`.
  4. Somente após o *commit* bem-sucedido no banco (`transaction.on_commit`), engatilhamos o Celery.
  5. O Worker lê o evento, envia o e-mail de forma assíncrona, e marca o evento como `PROCESSED`.
- **O Resultado:** Idempotência e garantia de entrega. Se o e-mail falhar, o evento continua salvo no banco e o Celery faz *retries* exponenciais. Nunca perdemos uma notificação e nunca enviamos e-mails duplicados.

---

## 5. Test-Driven Development (TDD)
A camada de domínio (`BookingService`) e a Autenticação foram desenvolvidas guiadas por testes automatizados com `pytest`.

**A Decisão:** Validar o comportamento antes da implementação.
- **Como foi feito:** Escrevi cenários para testar durações incorretas (menor que 15 min, maior que 8 horas), datas invertidas e, principalmente, simulações de sobreposição de horários (overlap).
- **O Resultado:** Garantia de que futuras manutenções não quebrarão as regras de negócio centrais (Regression Testing).

---

## 6. Autenticação e Segurança
Foi adotado o padrão JWT (JSON Web Tokens) através da biblioteca `rest_framework_simplejwt`.
- **Por que JWT?** Por ser *stateless*, não exige consultas constantes ao banco de dados para validar sessões, o que o torna altamente escalável e o padrão ideal para o consumo de APIs via Single Page Applications (React).