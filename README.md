# Idea Hut
Individual project for CSC309 (Programming on the Web) at the University of Toronto, St. George Campus, Winter 2015.  

Main goal: __build a site where users can find and post startup ideas in predefined categories.__

## Phase 1: Basic Features

#### Common
* user registration and authentication
* view startup idea titles, popularity, category and original poster
* filter startup ideas alphabetially, by date posted, by tags, by username, and by category

#### While Logged In
* post startup ideas
* update your own ideas
* delele your own ideas
* view startup idea details
* like or dislike other ideas


<br>
## Phase 2: RESTful Interface Features

### Get top k ideas between two dates.
url: `/api/top/k/start-date/end-date`
Where `k` is an integer greater than 1, `start-date` and `end-date` are date strings (can be any format supported by JavaScript's `Date` object).
Returns a JSON array of startup ideas.

### Distrubution Graph
url: `/api/distribution/view`
Returns the distribution graph in HTML form.

### Additional RESTful Interface Feature
* The distribution graph itself uses the RESTful interface pull data. It does this by sending an AJAX request to the route `/api/distribution`.


<br>

## Install and Run
Requirements: [Node.js](https://nodejs.org/) and [Sails](http://sailsjs.org/).  
Note: This project was built with Node.js v0.12.2 and Sails v0.11.

1. Install Sails:  
  `# npm install -g sails`

2. Clone this repository and install additional modules. The `sails-mongo` adapter was used to connect to a MongoDB database. Note that a connection to any database other than MongoDB will require editing a few controller actions.
  ```
  $ git clone https://github.com/seedform/Idea-Hut.git
  $ cd Idea-Hut
  $ npm install sails-mongo --save
  ```
3. Configure your MongoDB connection in `config/connections.js`.
4. Lift the server:  
  ```
  # sails lift
  ```
