// Load DOM with jQuery.ready
$(function(){
  
  // Category model
  // --------------
  var Category = Backbone.Model.extend({
    
    // return array of tasks in this category
    defaults: function() {
      return {
        tasks: []
      };
    },
    
    // add task to this category
    addTask: function(taskID) {
      var array = this.get("tasks");
      array.push(taskID);
      this.set({"tasks": array});
      this.save();
      this.trigger("add:tasks", Tasks.get(taskID));
    },
    
    // remove task from this category
    removeTask: function(taskID) {
      var array = this.get("tasks");
      for (var i = 0; i < array.length; i++) {
        if (array[i] == taskID) {
          // remove element using splice(index, numElementsToRemove)
          array.splice(i, 1);
          this.set({"tasks": array});
          this.save();
          this.trigger("remove:tasks", Tasks.get(taskID));
        }
      }
    },
    
    // get task in this category
    getTask: function() {
      // from underscore.js, _.map(list, iterator) 
      return _.map(this.get("tasks"), function(taskId) {
        return Tasks.get(taskID);
      });
    }
  });
  
  // Category collection (ordered set of all category objects)
  // --------------------------------------------------------
  var CategoryList = Backbone.Model.extend({
    model: Category,
    // save to local storage (not remote server) with namespace "backbone-category"
    localStorage: new Backbone.LocalStorage("backbone-category")
  });
  
  var Categories = new CategoryList();
  
  // Category view
  // -------------
  var CategoryView = Backbone.View.extend({
    tagName:  "li",
	
    template: _.template($('#category-template').html()),

    events: {
      "click span.category-name"    : "edit",
      "click span.category-destroy"   : "clear",
      "keypress .category-input"      : "updateOnEnter"
    },

    initialize: function() {
      this._taskViews = {};
      $(this.el).addClass("category-item");
      this.render();
      this.model.bind('change', this.setText, this);
      this.model.bind('destroy', this.remove, this);
      this.model.bind('add:tasks', this.addTask, this);
      this.model.bind('remove:tasks', this.removeTask, this);
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.setText();

      var that = this;
      this.$("ul.category-tasks").sortable({
        dropOnEmpty: true,
        connectWith: "ul.category-tasks",
        receive: function(event, ui) {
          var category = that.model;
          var id = $(ui.item[0]).attr("id"); 
          var task = tasks.get(id);
          var oldcategory = task.getcategory();

          task.setcategory(category.id);
          oldcategory.removeTask(task.id);
          category.addTask(task.id);
        }
      });
      return this;
    },

    setText: function() {
      var name = this.model.get('name');
      this.$('.category-name').text(name);
      this.input = this.$('.category-input');
      this.input.bind('blur', _.bind(this.close, this)).val(name);
    },

    toggleFavorite: function() {
      this.model.toggle();
    },

    edit: function() {
      $(this.el).addClass("edit-category");
      this.input.focus();
    },

    close: function() {
      this.model.save({name: this.input.val()});
      $(this.el).removeClass("edit-category");
    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    addTask: function(task) {
      var view = new taskView({model: task});
      this._taskViews[task.cid] = view;
      this.$('ul.category-tasks').append(view.render().el);
    },

    removeTask: function(task) {
      var task = this._taskViews[task.cid];
      task.remove();
    },

    addTasks: function(task) {
      var that = this;
      var col = this.model.gettasks(); 
      if (col.length == 0) return;
      _.each(col, function(task) {
        that.addTask(task);
      });
    },

    remove: function() {
      $(this.el).remove();
    },

    clear: function() {
      this.model.destroy();
    }
  });
 
  // Task model
  // ----------
  var Task = Backbone.Model.extend({
    defaults: function() {
      return {
        done: false,
        category: 0, 	// categoryID
        order: Tasks.nextOrder()
      };
    },
    
    // toggle if task is done or not
    toggle: function() { 
      this.save({done: !this.get("done")});
    },
    
    // get category of this task
    getCategory: function() {
      return Categories.get(this.get("category"));
    },
  
    // set category for this task
    setCategory: function(categoryID) {
      this.save({category: categoryID});
    }
	
  });
  
  // Task collection (ordered set of all task objects)
  // -------------------------------------------------
  var TaskList = Backbone.Model.extend({
    model: Task,
    // save to namespace "backbone-task"
    localStorage: new Backbone.LocalStorage("backbone-task")
  });
  
  var Tasks = new TaskList();
  
  // Task view
  // ---------
  var TaskView = Backbone.View.extend({
    tagName:  "li",

    template: _.template($('#task-template').html()),

    events: {
      "click span.task-text"    : "edit",
      "click span.task-destroy"   : "clear",
      "keypress .task-input"      : "updateOnEnter"
    },

    initialize: function() {
      $(this.el).addClass("task-item");
      $(this.el).attr("id", this.model.id);
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);

    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.setText();
      return this;
    },

    setText: function() {
      var text = this.model.get('text');
      this.$('.task-text').text(text);
      this.input = this.$('.task-input');
      this.input.bind('blur', _.bind(this.close, this)).val(text);
    },

    toggleFavorite: function() {
      this.model.toggle();
    },

    edit: function() {
      $(this.el).addClass("edit-task");
      this.input.focus();
    },

    close: function() {
      this.model.save({text: this.input.val()});
      $(this.el).removeClass("edit-task");
    },

    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    addToCategory: function(Category_el) {
      $(Category_el).append(this.el);
    },

    remove: function() {
      $(this.el).remove();
    },

    clear: function() {
      var category = this.model.getCategory();
      category.removetask(this.model.id);
      this.model.destroy();
    }

  });
  
  // The application
  // ---------------
  var NoteApp = Backbone.View.extend({
  
    el: $("#noteapp"),

    events: {
      "keypress #new-task":  "createTaskOnEnter",
      "keypress #new-category":  "createCategoryOnEnter"
    },

    initialize: function() {
      this.taskInput    = this.$("#new-task");
      this.categoryInput = this.$("#new-category");

      Categories.bind('add',   this.addCategory, this);
      Categories.bind('reset', this.addCategories, this);

      Tasks.fetch();
      Categories.fetch();

      if (Categories.length == 0) {
	    Categories.create({name: "Applied Internet Technologies"});
      Categories.create({name: "Object-Oriented Programming"});
      Categories.create({name: "Computer Architecture"});
		  Categories.create({name: "Operating Systems"});
		  Categories.create({name: "Leadership"});
		  Categories.create({name: "Chores"});
      }
    },

    addCategory: function(category) {
      var view = new CategoryView({model: category});
      this.$("#category-list").append(view.render().el);
      view.addCategories();
    },
	
    addCategories: function() {
      Categories.each(this.addCategory);
    },

    createTaskOnEnter: function(e) {
      var text = this.taskInput.val();
      if (!text || e.keyCode != 13) return;
	  
      var initialCategory = Categories.at(0);
      var task = Tasks.create({text: text}); 
      task.setCategory(initialCategory.id);
      initialCategory.addTask(task.id);
      this.taskInput.val('');
	  // console.log("Creating task!");
    },

    createCategoryOnEnter: function(e) {
      var text = this.categoryInput.val();
      if (!text || e.keyCode != 13) return;
      Categories.create({name: text});
      this.categoryInput.val('');
	  // console.log("Creating category!");
    }

  });

  var App = new NoteApp();
  // console.log("App made!");
  
}); // end function
