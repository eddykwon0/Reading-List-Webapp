const graphql = require('graphql');
const { responsePathAsArray } = require('graphql');
// const _ = require('lodash');
const Book = require('../models/book');
const Author = require('../models/author');
const { applyMiddleware } = require('graphql-middleware');

// In this file, we will describe our schemas
// Schemas describe object types, relation between data types, how we can access the graph to interact 
// with that data - whether it be to query and retrieve data or to mutate/change the data

const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} = graphql;


const BookType = new GraphQLObjectType({
  name: 'Book',
  // fields are like genre, id, etc..
  // needs to be a function to handle multiple types referencing each other
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: { 
      type: AuthorType,
      resolve(parent, args) {
        // console.log(parent); // logs the book object retrieved when querying book
        //return _.find(authors, { id: parent.authorId });
        return Author.findById(parent.authorId);
      }
    }
  })
});


const AuthorType = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      // author has many books, so you need to use a new graphql object to store values
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        //return _.filter(books, { authorId: parent.id });
        return Book.find({ authorId: parent.id });
      }
    }
  })
});


// define root queries - the entry point from frontend to graph
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  // each root query is a different field inside this RootQueryType
  // fields doesn't have to be wrapped in a function because order does not matter
  fields: {
    // name of field matters - should match query from frontend
    // frontend query would look like...
    // book(id: '1') {
    //   name
    //   genre
    // }
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // write code to get data from database/other source
        // data can be stored in SQL or noSQL database
        // use lodash to search books array
        //return _.find(books, { id: args.id });
        return Book.findById(args.id);
      }
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        //return _.find(authors, { id: args.id });
        return Author.findById(args.id);
      }
    },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        //return books;
        return Book.find({});
      }
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve(parent, args) {
        //return authors;
        return Author.find({});
      }
    }
  }
});

// in GraphQL we need to explicitly define our mutations
// set up is similar to RootQuery
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addAuthor: {
      type: AuthorType,
      args: { 
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parent, args) {
        // use imported mongoose model to create a new instance of that model
        // save new Author instance in a local variable
        // let author = new Author({
        //   name: args.name,
        //   age: args.age
        // });
        // return author.save();
        return Author.create({ 
          name: args.name, 
          age: args.age 
        });
      }
    },
    addBook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parent, args) {
        return Book.create({
          name: args.name,
          genre: args.genre,
          authorId: args.authorId
        });
      }
    }
  }
});


// To make multiple mutations of the same type, use aliases
// 
// mutation{
//   addAuthor1: addAuthor(name: "Patrick Rothfuss", age: 44){
//     name
//     age
//   }
//   addAuthor2: addAuthor(name: "Brandon Sanderson", age: 42) {
//     name
//     age
//   }
//   addAuthor3: addAuthor(name: "Terry Pratchett", age: 66) {
//     name
//     age
//   }
// }

// const loggingMiddleware = async (resolve, root, args, context, info) => {  
//   console.log(`Input arguments: ${JSON.stringify(args)}`)  
//   const result = await resolve(root, args, context, info)  
//   console.log(`Result: ${JSON.stringify(result)}`)  
//   return result
// }


const timerMiddleware = async (resolve, root, args, context, info) => {
  // console.log('timer in ');
  // return;
  const startTime = process.hrtime();
  const result = await resolve(root, args, context, info); // execute resolver
  const elapsedTime = process.hrtime(startTime)
  const elapsedTimeInMs = (elapsedTime[0] * 1000) + (elapsedTime[1] / 1e6); // convert to ms
  
  const parentType = info.parentType;
  const fieldName = info.fieldName;
  
  if (context.cache[parentType] === undefined) {
    console.log('STARTING NEW CACHE\n');
    // write to file or send to GUI when new query start
    context.cache = {};
    context.cache[parentType] = [[fieldName, elapsedTimeInMs]];
  } else {
    console.log('PUSHING TO EXISTING\n');
    context.cache[parentType].push([fieldName, elapsedTimeInMs]);
  }

  console.log(`CONTEXT: ${JSON.stringify(context)} \n\n`);
  // console.log(`CONTEXT: ${context}`);

  // console.log(`Finished for ${parentType}! this query took ${elapsedTimeInMs} ms`);
  return result;
}

// I wish we could tell when its our code thats breakjing it, vs. when mongo is just taking a minute
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

// const schemaWithMiddleware = applyMiddleware(schema, timerMiddleware)

// module.exports = schemaWithMiddleware;

module.exports = schema;

// module.exports = new GraphQLSchema({
//   // passing options to GraphQLSchema - which queries and mutations users can make from the front end
//   query: RootQuery,
//   mutation: Mutation
// });