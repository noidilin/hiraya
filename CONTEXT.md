# Hiraya DevOps Portfolio

This context defines the project-specific language used to describe the portfolio platform, its operational roles, and its AI-assisted operations capability.

## Language

**Kira**:
The AI-assisted SRE persona that helps diagnose incidents by explaining likely root causes, supporting evidence, immediate fixes, and prevention steps.
_Avoid_: chatbot, bot, generic assistant

**Operator**:
A person allowed to inspect operational signals and use Kira to investigate the health of the deployed platform.
_Avoid_: anonymous user, public visitor, customer

**Diagnosis Session**:
A focused conversation between an Operator and Kira about one operational symptom or incident, where follow-up questions reuse the prior investigative context.
_Avoid_: stateless prompt, isolated question
