# NeoTool

![Home screen image](https://imgur.com/5aY9Fzn.jpg)

NeoTool provides easy-to-use tools that allows a non-technical user to enjoy Cypher interrogation language via an User Interface.

This application is part of an University thesis (Università degli Studi di Milano, Italy) project.

Thesis title is: _User interfaces and standard vocabularies in graph databases_.

## Features

NeoTool offers a way to manage a [Neo4j](https://neo4j.com/) graph database with forms without the need to write Cypher to apply changes to your database.

NeoTool can:

- Configuration file management:
  - Create a new configuration file;
  - Edit an existing configuration file.
- Graph database management:
  - Insert nodes;
  - Edit nodes;
  - Insert relationships;
  - Edit relationships.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install the necessary packages to run NeoTool.

Run this command to install the packages:

```bash
npm install
```

To use this application you need to have Neo4j installed on your machine.

Create a new graph database inside Neo4j client and start it.

NeoTool uses an environment file to setup the application with all your data. These data are:

| FIELD          | VALUE                                     |
| -------------- | ----------------------------------------- |
| PORT           | Bolt port used to connect to Neo4j graph. |
| USERNAME_NEO4J | Username of Neo4j graph.                  |
| PASSWORD_NEO4J | Password of Neo4j graph.                  |
| SLASH          | /                                         |

NeoTool uses also a JSON file to store a graph configuration in which it's described the composition of your nodes, the attributes and the relationships that connect the nodes.

Inside the folder **test_files** there is a zip file containing a sample env file and a test JSON configuration file if you want to test the application.

Change the value inside the test env file with your data (only port, username and password) and place the '.env' file inside the root folder of the application.

## Usage

Once you have installed the packages and have a running Neo4j graph database, run on the root folder:

```bash
node app.js
```

and then navigate to **localhost:3000** on your browser.

Navigate to the configuration page and upload the configuration provided (or created) and start using NeoTool!

## Screenshot

![Insert screen image](https://imgur.com/xaQ2XR0.jpg)
![Relationship screen image](https://imgur.com/fzL98r0.jpg)
![Explore screen image](https://imgur.com/rXCvGJX.jpg)

## Contacts

Inside the about page there is a section with all the links to contact me.

Feel free to ask about the application and leave a feedback to improve NeoTool!

## License

[MIT](https://choosealicense.com/licenses/mit/)
