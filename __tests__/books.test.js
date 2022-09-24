process.env.NODE_ENV === "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async () => {
    let result = await db.query(`
      INSERT INTO
        books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES(
          '0222869016',
          'https://amazon.com/lemon',
          'Amitav Ghosh',
          'English',
          100,
          'Penguin',
          'Sea of Poppies', 2015)
        RETURNING isbn`);
  
    book_isbn = result.rows[0].isbn
  });

  
  describe ("DELETE /books", function () {
    test("Deletes book from db", async function () {
        const response = await request(app).delete(`/books/${book_isbn}`)
        expect (response.body).toEqual({message: "Book deleted"});
    })

    test("Returns error if book not in db", async function () {
        const response = await request(app).delete(`/books/542`)
        expect (response.statusCode).toBe(404);
    })
  })

  describe("POST /books", function () {
    test("Creates a new book", async function () {
      const response = await request(app)
          .post(`/books`)
          .send({
            isbn: '986934424',
            amazon_url: "https://amotiva.com",
            author: "Someone",
            language: "english",
            pages: 1000,
            publisher: "Oxford",
            title: "something else",
            year: 2005
          });
      expect(response.statusCode).toBe(201);
      expect(response.body.book).toHaveProperty("isbn");
    });

    test("Missing data results in error", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({title: "a;aala"});
        expect(response.statusCode).toBe(400);
      });
    });
    

afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
  });
  
  
  afterAll(async function () {
    await db.end()
  });