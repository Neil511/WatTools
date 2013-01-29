var EntryEditor = Backbone.View.extend({
  el: '#item-editor',

  events: {
    'click .faux-button[type=edit_entry]': 'edit_entry_btn',
    'click .faux-button[type=delete_entry]': 'delete_entry_btn'
  },

  delete_entry_btn: function(e) {
    if(confirm('Are you sure you want to delete this item?')) {
      var index = $(e.target).attr('parameter');
      var LinkData = this.model.get('LinkData');
      LinkData.entries.splice(index, 1);
      this.model.set('LinkData', LinkData);
      this.render();
    }
  },

  initialize: function(model) {
    this.model = model;
    this.render();
  },

  render: function() {
    debug.time('render entries');
    var view, entry, field, fields_data, entries_data, this_entry, property, this_field, entries = this.model.get('LinkData').entries,
      fields = this.model.get('LinkData').fields;

    //gather data from all entries
    entries_data = [];
    for(entry in entries) {
      if(Object.prototype.hasOwnProperty.call(entries, entry)) {
        //the sorting function  needs to know the index, but is not given it
        //so we keep track of it ourselves
        entries[entry].sort_id = entry;

        this_entry = this.model.get('LinkData').entries[entry];

        fields_data = [];
        //go through each field to organize the data
        for(field in fields) {
          if(Object.prototype.hasOwnProperty.call(fields, field)) {
            this_field = fields[field];
            property = this_entry[this_field.name];
            //if this entry has a property coresponding to this field
            if(property !== undefined && property.text !== '') {
              fields_data.push({
                'class': this_field['class'],
                link: property.url,
                label: this_field.label,
                text: property.text
              });
            }
          }
        }

        //build the data for this entry
        entry_data = {
          id: 'item_' + entry,
          fields: fields_data,
          buttons: { //partial
            buttons: [{
              label: 'Edit',
              type: 'edit_entry',
              parameter: entry
            }, {
              label: 'Delete',
              type: 'delete_entry',
              parameter: entry
            }] //array
          }
        };

        entries_data.push(entry_data);
      }
    }

    view = {
      entries: entries_data,
      edit_mode: this.model.get('edit_mode'),
      partials: ['buttons']
    };

    this.$el.html($.mustache('entries', view));
    this.complex_behaviors();
    this.delegateEvents(this.events);
    debug.timeEnd('render entries');
    return this;
  },

  complex_behaviors: function() {

  },


  // Open a modal to edit the entry with this index
  // 
  // Modifies watedit.LinkData and triggers redraw of entries
  edit_entry_btn: function(e) {
    var index = $(e.target).attr('parameter');
    this.edit_entry(index);
  },

  edit_entry: function(index) {
    var this_field, property, field, $field, view, title, fields_data, field_data, entry = this.model.get('LinkData').entries[index],
      fields = this.model.get('LinkData').fields,
      $fields = $('<div>');

    fields_data = [];
    for(field in fields) {
      if(Object.prototype.hasOwnProperty.call(fields, field)) {
        this_field = fields[field];
        property = entry[this_field.name];
        field_data = {
          val: property ? property.text : '',
          label: this_field.name,
          purpose: 'text',
          field: this_field.name,
          multiline: this_field.multiline
        };

        //text input
        fields_data.push(field_data);

        //url input
        if(this_field.url) {
          //make a copy of the old data
          field_data = $.extend({}, field_data);
          field_data.label += ' url';
          field_data.val = property ? property.url : '';
          field_data.purpose = 'url';
          //then add a field for the url
          fields_data.push(field_data);
        }
      }
    }
    view = {
      inputs: fields_data
    };

    title = entry[this.model.get('LinkData').fields[0].name] ? entry[this.model.get('LinkData').fields[0].name].text : 'Untitled';

    var that = this;

    submit_cancel_dialog($.mustache('form', view), title, function() {
      var $dialog = $(this),
        $inputs = $('input,textarea', $dialog),
        $input, purpose, field, val, n, length;

      try {
        //get all the inputs and text areas
        for(n = 0, length = $inputs.length; n < length; n += 1) {
          $input = $($inputs[n]); //get the input element
          val = $input.val(); //new value to set
          field = $input.attr('field'); //field to edit
          purpose = $input.attr('purpose'); //text or url
          //create the field if it didn't exist but we are giving it a value
          if(entry[field] === undefined && val !== '') {
            entry[field] = {};
          }

          //set the value
          if(entry[field] !== undefined) {
            if(val !== '') {
              if(purpose == 'url' && val.substr(0, 4) != 'http') {
                throw 'Invalid URL';
              }
              entry[field][purpose] = val;
            } else {
              delete entry[field][purpose];
            }
          }
          //remove empty object
          if($.isEmptyObject(entry[field])) {
            delete entry[field];
          }
        }
        that.render();
        $dialog.dialog("close");
      } catch(e) {
        $.jGrowl(e.toString());
      }
    }, 'Save');
  }


});