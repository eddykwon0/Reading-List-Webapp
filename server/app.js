const express = require('express');
// convention is to have different variable name for importing express-graphql - graphqlHTTP vs express-graphql
const { graphqlHTTP } = require('express-graphql');
const schemaWithMiddleware = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 4000;

// connect to mongodb
mongoose.connect('mongodb+srv://eddy:password4CS@cluster0.46d6q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
mongoose.connection.once('open', () => {
  console.log('Connected to database!')
});

// cors
app.use(cors());

// pass control of this request to graphqlHTTP which can handle graphql requests
// graphqlHTTP requires a schema that describes how our graph looks as an argument
app.use('/graphql', graphqlHTTP({
  schema: schemaWithMiddleware, // same as schema: schema
  graphiql: true
}));


app.listen(PORT, () => console.log(`Now listening for requests on ${PORT}`));