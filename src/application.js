// Loading DOM with jQuery.ready
$(function(){
  
  // Note model
  // ------------
  window.Note = Backbone.Model.extend({
    
    // return array of categories (ie. class, chore, extracurricular)
    defaults: function() {
      return {
        categories: [];  
      };
    },
    
    // add a category
    addCategory: function(categoryID) {
      var array = this.get("categories");
      array.push(categoryID);
      this.set({"categories": array});
      this.save();
      this.trigger("add:categories", Categories.get(categoryID));
    },
    
    // remove a category
    removeCategory: function(categoryID) {
      var array = this.get("categories");
      for (var i = 0; i < array.length; i++) {
        if (array[i] == labelID) {
          // remove element using splice(index, numElementsToRemove)
          array.splice(i, 1);
          this.set({"categories": array});
          this.save();
          this.trigger("remove:categories", Categories.get(categoryID));
        }
      }
    },
    
    // getLabel()
    getCategory: function() {
      // from underscore.js, _.map(list, iterator) 
      return _.map(this.get("categories"), function(categoryId) {
        return Categories.get(categoryID);
      });
    }
  });
  
  // Notes collection (ordered set of all notes)
  // ---------------------------------------------------------
  window.NoteList = Backbone.Model.extend({
    model.Note,
    // save to local storage (not remote server) with namespace "backbone-note"
    localStorage: new Backbone.LocalStorage("backbone-note")
  });
  
  window.Notes = new NoteList();
  
  // Note view
  // ---------
 
  // Category model
  // -----------
  window.Category = Backbone.Model.Extend({
    defaults: function() {
      return {
        done: false,
        noteID: 0,
        order: Categories.nextOrder()
      };
    },
    
    // toggle if task is done or not
    toggle: function() { 
      this.save({done: !this.get("done")});
    },
    
    // get note with this category
    getNote: function() {
      return Buckets.get(this.get("note"));
    },
  
    // set note for this category
    setNote: function(noteID) {
      this.save({noteID: noteID});
    }
  });
  
  // Category collection (ordered set of all Category objects)
  // ---------------------------------------------------------
  window.CategoryList = Backbone.Model.Extend({
    model.Category,
    // save to namespace "backbone-category"
    localStorage: new Backbone.LocalStorage("backbone-category")
  });
  
  window.Categories = new CategoryList();
  
  // Category view
  // -------------
  
  // The application
  // ---------------
  
}); // end function
