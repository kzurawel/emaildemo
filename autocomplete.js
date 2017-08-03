(function($) {
  $.fn.autocomplete = function (options) {
    var options = options || {};
    // Options:
    // listSelector: selector for list container adjacent to label
    // entrySelector: selector for entries within list container
    // url: AJAX url
    // entryTemplate: lodash template function for entries
    // onBeforeSearch: (optional) handler to run before making search request
    // onAfterSelect: (optional) handler for selecting an entry
    // allowMultipleSelect: (default: false) allow multiple selections by adding commas when Space is pressed

    var input = this;
    var list = input.parent().siblings(options.listSelector);
    var entryIndex = -1;

    input.on('keyup', function (event) {
      if (event.key.length > 1 &&
          event.key !== 'Backspace') {
        return;
      }
      var searchParams;

      if (options.onBeforeSearch) {
        searchParams = options.onBeforeSearch(input.val());
      } else {
        searchParams = input.val();
      }

      if (!searchParams) {
        list.empty();
        return;
      }

      $.ajax({
        url: options.url + '/' + searchParams,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
          list.empty();
          var users = data.users;
          var totalUsers = users.length;
          var displayRows = totalUsers > 25 ? 25 : totalUsers;

          for (var i=0; i < displayRows; i++) {
            list.append(options.entryTemplate({user: users[i]}));
          }

          if (totalUsers > displayRows) {
            list.append('<span>' + totalUsers + ' matching users, displaying 1-25</span>');
          }
        },
        error: function (error) {
          console.log(error);
        }
      });
    });

    input.on('keydown', function (event) {
      switch (event.key) {
        case 'Tab':
          if ($(options.entrySelector).length) {
            event.preventDefault();
            if (entryIndex < list.find(options.entrySelector).length - 1) {
              entryIndex += 1;
            } else {
              entryIndex = 0;
            }
            list.find(options.entrySelector).removeClass('active');
            list.find(options.entrySelector).eq(entryIndex).addClass('active');
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (entryIndex > 0) {
            entryIndex -= 1;
          } else {
            return;
          }
          list.find(options.entrySelector).removeClass('active');
          list.find(options.entrySelector).eq(entryIndex).addClass('active');
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (entryIndex < list.find(options.entrySelector).length - 1) {
            entryIndex += 1;
          } else {
            return;
          }
          list.find(options.entrySelector).removeClass('active');
          list.find(options.entrySelector).eq(entryIndex).addClass('active');
          break;
        case 'Enter':
          event.preventDefault();
          if (entryIndex !== -1) {
            handleEntrySelect(list.find('.active'));
          }
          break;
        case ' ':
        case ',':
          event.preventDefault();
          if (options.allowMultipleSelect) {
            input.val(input.val() + ',');
          }
          break;
        default:
          return;
      }
    });

    list.on('click', options.entrySelector, function (event) {
      console.log($(event.target).attr('data-value'));
      handleEntrySelect($(event.target));
    });

    function handleEntrySelect (selectedEntry) {
      if (options.onAfterSelect) {
        options.onAfterSelect(input, selectedEntry);
      } else {
        input.val(selectedEntry.attr('data-value'));
      }
      input.focus();
      entryIndex = -1;
      list.empty();
    }
  }
})(jQuery);
