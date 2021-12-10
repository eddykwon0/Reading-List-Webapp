const express = require('express');
// convention is to have different variable name for importing express-graphql - graphqlHTTP vs express-graphql
const { graphqlHTTP } = require('express-graphql');
// const schemaWithMiddleware = require('./schema/schema');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');

// goTrace import
// const goTrace = require('./trace.js');
const goTrace = require('go-trace')

const app = express();
const PORT = 4000;

// connect to mongodb
mongoose.connect('mongodb+srv://eddy:password4CS@cluster0.46d6q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
mongoose.connection.once('open', () => {
  console.log('Connected to database!')
});

// cors
app.use(cors());

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// pass control of this request to graphqlHTTP which can handle graphql requests
// graphqlHTTP requires a schema that describes how our graph looks as an argument
app.use('/graphql', async (req, res) => { 
  console.log(req.body);
  let response = await goTrace(schema, req.body.query, null, null, req.body.variables);
  return res.status(200).send(response);
});

// goTrace(schema, query, root, context, variables)


// app.use('/graphql', (req, res, next) => {
//   console.log(req.query);
//   return next();
// },
//   graphqlHTTP({
//     schema: schema, // same as schema: schema
//     graphiql: true,
//     context: {
//       cache: {}
//     }
//   }));
// app.use('/graphql', graphqlHTTP({
//   schema: schemaWithMiddleware, // same as schema: schema
//   graphiql: true,
//   context: {
//     cache: {}
//   }
// }));


app.listen(PORT, () => console.log(`Now listening for requests on ${PORT}`));