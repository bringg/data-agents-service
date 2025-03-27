# data-agents-service
The purpose of the `data-agents-service` is to implement LangGraph workflow graphs that receive business questions and respond via a Large Language Model (LLM) based on data from the analytics-service. The documentation data is sourced from the pages at [Bringg Help](https://help.bringg.com/) via Retrieval-Augmented Generation (RAG). The analytics-service provides connections to BI dashboards and a reports builder. Additionally, the graph supports a human-in-the-loop mechanism and stores threads in Redis to continue chats.

## Features

- **LangGraph Workflow Graphs**: Implement workflow graphs to handle business questions.
- **LLM Integration**: Respond to queries using a Large Language Model.
- **Data Source**: Utilize documentation from Bringg Help via RAG.
- **Analytics Service**: Connect to BI dashboards and reports builder.
- **Human-in-the-Loop**: Support for human intervention in the workflow.
- **Thread Redis Storage**: Store conversation threads for continued interactions.

## Getting Started

To get started with the `data-agents-service`, follow these steps:

1. Clone the repository:
    ```sh
    git clone git@github.com:bringg/data-agents-service.git
    ```
2. Install dependencies:
    ```sh
    cd data-agents-service
    npm install
    ```
3. Run locally analytics-service and dongosolo:
    [Setup Analytics-Service locally](https://bringg.atlassian.net/wiki/spaces/PH/pages/4124966936/Setup+Analytics-Service+locally)

4. Add to env locally (.zshrc/.zsh)
    - GCLOUD_AUTH token via terminal command "gcloud auth print-access-token"
    - analyticsJWT token via Bringg Web

5. Optional - document out the @security decorator at chat.controller 

6. Start the service:
    ```sh
    npm run start-dev
    ```

## Usage

Once the service is running, you can interact with it by sending business questions to the endpoints provided below. The service will process the questions using the LangGraph workflow and respond with answers based on the data from the analytics-service.

## Endpoints via Postman

1. **New/Continue Chat** - `GET http://localhost:3010/chat/:message?threadId=thread_id`
   - Creates a new chat thread or continues an existing one
   - Path Parameters:
     - `message`: The message to send
   - Query Parameters:
     - `threadId`: (Optional) The ID of the chat thread to continue. If not provided, creates a new thread

2. **Get Chat History** - `GET http://localhost:3010/chat/history/:thread_id`
   - Retrieves the chat history for a specific thread
   - Path Parameters:
     - `thread_id`: The ID of the chat thread to retrieve

3. **Test Endpoint** - `GET http://localhost:3010/chat/test`
   - Test endpoint that returns an empty array of messages

Note: The service currently has security disabled for development purposes. In production, it uses JWT authentication.

## Contributing

We welcome contributions to improve the `data-agents-service`. Please fork the repository and submit pull requests. 