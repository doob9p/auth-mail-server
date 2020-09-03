import "./env";

import { GraphQLServer } from "graphql-yoga";
import morgan from "morgan";
import schema from "./schema";
import auth from "./routes/auth";

const port = process.env.PORT || 4000;

const server = new GraphQLServer({ schema });

server.express.use(morgan("dev"));
server.express.use("/auth", auth);

server.start({ port }, () => console.log(`GraphQL server running on ${port}`));
