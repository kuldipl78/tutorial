const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
const dbpath = path.join(__dirname, 'moviesData.db')
app.use(express.json())
let db = null

const initializatnDBServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`Server Running At http://localhost:3000/`)
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
  }
}

initializatnDBServer()

//GET Method returns all movie names in the movie table
app.get('/movies/', async (request, response) => {
  try {
    const getMovieQuery = `
            SELECT 
            movie_name
            FROM 
            movie`
    const movies = await db.all(getMovieQuery)
    const movieNames = movies.map(movie => ({movieName: movie.movie_name}))
    response.status(200).json(movieNames)
  } catch (error) {
    console.log(`Error Fetching Players ${error.message}`)
    response.status(500).send('Internal Server Error Message')
  }
})

//POST API
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const movieQuery = `
    INSERT INTO
    movie
    (director_id, movie_name, lead_actor)
    VALUES
    (?, ?, ?)`
  const dbResponse = await db.run(movieQuery, [
    directorId,
    movieName,
    leadActor,
  ])
  const movieId = dbResponse.lastID
  response.status(200).json('Movie Successfully Added')
})

// GET Method Based On id
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const moviegeQuery = `
    SELECT
    movie_id AS movieId,
    director_id AS directorId,
    movie_name AS movieName,
    lead_actor AS leadActor
    FROM 
    movie
    WHERE movie_id = ${movieId};`
  const movie = await db.get(moviegeQuery)
  response.status(200).json(movie)
})

// put method
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const putDataQuery = `
    UPDATE
    movie
    SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};`
  await db.run(putDataQuery)
  response.status(200).send('Movie Details Updated')
})

// delete API
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDeleteQuery = `
  DELETE
  FROM 
  movie
  WHERE
  movie_id = ${movieId}`
  await db.run(movieDeleteQuery)
  response.send('Movie Removed')
})

// API Director
app.get('/directors/', async (request, response) => {
  try {
    const directorQuery = `
      SELECT
      director_id AS directorId,
      director_name AS directorName
      FROM
      director
      ORDER BY
      director_id;`

    const directorArray = await db.all(directorQuery)
    response.status(200).json(directorArray)
  } catch (error) {
    response.status(500).json({error: error.message})
  }
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const queryDirectorId = `
      SELECT 
      movie.movie_name AS movieName
      FROM
      movie
      NATURAL JOIN director;`
  const names = await db.all(queryDirectorId)
  response.status(200).send(names)
})
