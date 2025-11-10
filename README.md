# 🚀 Bot Data Storage API: PostgreSQL + JSONB

This is a flexible, high-performance HTTP API designed to store configuration and state data for bots (like Discord, Slack, or Telegram bots) without relying on traditional document databases like MongoDB.

It leverages PostgreSQL with the powerful JSONB column type to offer the best of both worlds: the reliability and transactional integrity of a relational database, combined with the schemaless flexibility of document storage.

## ✨ Features

NoSQL Flexibility with SQL Reliability: Stores dynamic JSON objects in a JSONB column, allowing for varied data structures (like user preferences or complex guild settings).

Simple REST Endpoints: Provides a clean set of endpoints for standard CRUD operations (GET, POST, DELETE).

**Render Optimized**: Built specifically for easy, scalable deployment on the Render cloud platform.

## 🛠️ Deployment on Render

This API is designed to be deployed as a Web Service on Render, connected to a managed Render PostgreSQL instance.

### Prerequisites

A Render account.

A Git repository containing the server.js file.

### Deployment Steps

#### 1. Setup the PostgreSQL Database

In the Render Dashboard, click New > PostgreSQL.

Choose your desired region and plan (note: the free tier is great for testing but expires after 30 days).

Click Create Database.

Render will manage the connection details, automatically exposing the DATABASE_URL to your Web Service.

#### 2. Deploy the Web Service

In the Render Dashboard, click New > Web Service.

Connect your Git repository.

Configure the settings:

Runtime: Node

Build Command: `npm install`

Start Command: `node server.js`

Instance Type: Choose your instance.

Connect the Database (Crucial Step): In the Environment settings for your Web Service, make sure you link the PostgreSQL database you created in step 1.

Click Create Web Service.

Once deployed, Render will provide a public URL (e.g., https://your-api-name.render.com). This is your API_BASE_URL.

## 🌐 API Endpoints Reference

All API operations use the :key parameter. This key should be a unique identifier for the data you are storing (e.g., user-12345, guild-config-9876, shop-inventory).

HTTP Method

Endpoint

Description

Request Body

Response Status

GET

/data/:key

Retrieves the JSON data document.

(None)

200 (Data found), 404 (Not found)

POST

/data/:key

Creates or Overwrites the entire JSON data document for the key.

Full JSON Object

200

DELETE

/data/:key

Deletes the data document associated with the key.

(None)

200 (Success), 404 (Not found)

### Example Usage

Here’s an example of how a bot would use the API (using a hypothetical Base URL).

Base URL Example: https://my-bot-data-api.render.com

#### 1. Saving (POST) or Updating Data

You send the complete data object you want to store. This action is an UPSERT (Insert or Update).

Request (e.g., setting a guild's prefix):

**POST** [https://my-bot-data-api.render.com/data/guild-8461029415](https://my-bot-data-api.render.com/data/guild-8461029415)
**Content-Type:** application/json

{
    "prefix": "!",
    "log_channel_id": "998877",
    "moderator_roles": ["Admin", "Mod"]
}




#### 2. Retrieving Data (GET)

Request (e.g., getting the guild's settings):

**GET** [https://my-bot-data-api.render.com/data/guild-8461029415](https://my-bot-data-api.render.com/data/guild-8461029415)




Successful Response:

{
    "prefix": "!",
    "log_channel_id": "998877",
    "moderator_roles": ["Admin", "Mod"]
}




#### 3. Deleting Data (DELETE)

Request (e.g., deleting data when the bot leaves a guild):

**DELETE** [https://my-bot-data-api.render.com/data/guild-8461029415](https://my-bot-data-api.render.com/data/guild-8461029415)
