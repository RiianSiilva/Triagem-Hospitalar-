# Sistema de Triagem Hospitalar com IA

ACEX— Otimização da triagem hospitalar usando o Protocolo de Manchester com IA.

## Como rodar

### Backend
1. Clone o repositório
2. Copie `application.properties.example` para `application.properties`
3. Preencha sua chave do Groq e senha do MySQL
4. Crie o banco: `CREATE DATABASE triagem_hospitalar CHARACTER SET utf8mb4;`
5. Rode no IntelliJ: `TriagemIaApplication.java` 
6. para quem usa o VScode para o java ### Extensões necessárias
- **Extension Pack for Java** (Microsoft)
- **Spring Boot Extension Pack** (VMware)
- **ES7+ React/Redux/React-Native snippets**

### Frontend
1. Entre na pasta `triagem-frontend`
2. Rode `npm install`
3. Rode `npm run dev`
4. Acesse `http://localhost:5173`

## Tecnologias
- Java 21 + Spring Boot 3.4.5
- LangChain4j + Groq (Llama 3.3 70B)
- React + Vite
- MySQL
