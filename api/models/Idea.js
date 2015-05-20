/**
* Idea.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    title: 'string',

    description: 'string',

    category: 'string',

    creator: 'string',

    tags: {
      type: 'array',
      defaultsTo: []
    },

    likes: {
      type: 'array',
      defaultsTo: []
    },

    dislikes: {
      type: 'array',
      defaultsTo: []
    },

    score: {
      type: 'integer',
      defaultsTo: 0
    }

  }

};

