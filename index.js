import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the "public/images" directory
app.use("/images", express.static("public/images"));


// DB connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "userdb",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to the MySQL database.");
  }
});

// Fetch users and their images
app.get("/", (req, res) => {
  const sql = "SELECT * FROM userdb";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Server connection failed" });

    // add image
    const users = result.map((userdb) => ({
      ...userdb,
      Photo: `http://localhost:${port}/images/${userdb.Photo}`,
    }));

    console.log(users); 
    res.json(users);
  });
});

//post
app.post('/userdb', (req,res)=>{
  const sql = 'INSERT INTO userdb ( `id`, `Name`, `Age`, `email`, `Photo`) VALUES (?,?,?,?,?)';
  const values = [
    req.body.id,
    req.body.Name,
    req.body.Age,
    req.body.email,
    req.body.Photo,
  ]
  db.query(sql, values, (err,result)=>{
    if(err) return res.json({Message:"Failed to Post"});
    return res.json(result);
  });
});

//Read
app.get('/read/:id', (req, res) => {
    const sql = 'SELECT * FROM userdb WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.json({ Message: "Server error" });
        
        // Add image URL if the result is not empty
        const user = result[0];
        if (user) {
            user.Photo = `http://localhost:${port}/images/${user.Photo}`;
        }

        return res.json([user]);
    });
});

//Update
app.put('/update/:id', (req,res)=>{
  const sql = 'UPDATE userdb SET Name=?, Age=?, email=?, Photo=? WHERE id = ?';
  const values = [req.body.Name, req.body.Age, req.body.email, req.body.Photo, req.params.id]
db.query(sql, values, (err, result) => {
        if (err) return res.json({ Message: "Failed to update user" });
        return res.json({ Message: "User updated successfully" });
    });
});

//Delete
app.delete('/delete/:id', (req,res)=>{
  const sql = "DELETE FROM userdb WHERE ID = ?";
   const userId = req.params.id;
    db.query(sql, [userId], (err, result) => {
        if (err) return res.json({ Message: "Failed to delete user" });
        return res.json({ Message: "User deleted successfully" });
    });
})

app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});
