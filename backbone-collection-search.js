//     Backbone.Collection.search v0.2.1
//     by Joe Vu - joe.vu@homeslicesolutions.com
//     For all details and documentation:
//     https://github.com/homeslicesolutions/backbone-collection-search

;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone', 'fuse.js'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('underscore'), require('backbone'), require('fuse.js'));
  } else {
    factory(root._, root.Backbone, root.Fuse);
  }

}(this, function (_, Backbone, Fuse) {

  // Extending out
  _.extend(Backbone.Collection.prototype, {

    buildFuse: function () {
      this.fuse = new Fuse([], {
        keys: _.result(this, 'searchable', []),
        id: 'cid',
        threshold: 0.4,
        distance: 20,
        tokenize: true
      });
    },

    //@ Search function
    search: function(keyword, attributes) {

      // If collection empty get out
      if (!this.models.length) return;
      if (!this.fuse) this.buildFuse();

      // set collection for Fuse
      this.fuse.set(this.map(function (model) {
        return _.extend({ cid: model.cid }, model.attributes);
      }));

      var results = this.fuse.search(keyword);

      results = _.map(results, function (cid) { return this.get(cid); }, this);

      // Instantiate new Collection
      var collection = new Backbone.Collection( results );
      collection.searching = {
        keyword: keyword,
        attributes: _.result(this, 'searchable', [])
      };
      collection.getSearchQuery = function() {
        return this.searching;
      };

      // Cache the recently searched metadata
      this._searchResults = collection;

      // Async support with trigger
      var that = this;
      var t = setTimeout(function(){
        that.trigger('search', collection);
        clearTimeout(t);
      },10);

      // For use of returning un-async
      return collection;
    },

    //@ Get recent search query
    getSearchQuery: function() {
      return this.getSearchResults() && this.getSearchResults().getSearchQuery();
    },

    //@ Get recent search results
    getSearchResults: function() {
      return this._searchResults;
    },

    //_Cache
    _searchResults: null

  });

  return Backbone;

}));
