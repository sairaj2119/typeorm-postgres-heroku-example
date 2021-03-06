import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { createConnection } from 'typeorm';
import express, { Request, Response } from 'express';
import { Todo } from './entity/Todo';
import { prodConnection } from './config';

(async () => {
  const app = express();

  app.use(express.json());

  app.get('/', (_: Request, res: Response) => {
    console.log('NODE_ENV is => ', process.env.NODE_ENV);
    console.log('PORT is => ', process.env.PORT);
    console.log('TEST env var is => ', process.env.TEST);
    console.log('YOO is => ', process.env.YOO);
    res.send('yes this is woking');
  });

  app.get('/todos', async (_: Request, res: Response) => {
    const todos = await Todo.find();
    return res.json(todos);
  });

  app.post('/todos', async (req: Request, res: Response) => {
    const { text } = req.body;
    if (text.trim() === '')
      return res.status(400).json({ error: 'todo canont be empty' });
    const todo = Todo.create();

    todo.text = text;
    await todo.save();
    return res.json(todo);
  });

  const PORT = process.env.PORT || 5000;

  if (process.env.NODE_ENV === 'production') {
    try {
      const connection = await createConnection(prodConnection);
      await connection.runMigrations();
      console.log('connected to the databse in prod');
      app.listen(PORT, () => {
        console.log('server is up and running at port', PORT);
      });
    } catch (error) {
      console.log(
        'Error while connecting to the database in production',
        error
      );
    }
  } else {
    createConnection()
      .then(() => {
        console.log('connected to databse locally');
        app.listen(PORT, () => {
          console.log('server is up and running at port', PORT);
        });
      })
      .catch((err) => {
        console.log('error in connecting to database locally');
        console.log(err);
      });
  }
})();
