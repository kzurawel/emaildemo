$(document).ready(function () {
  var autocompleteListTemplate = _.template('<div class="list-entry" data-value="<%= user.email %>"><%= user.firstName %> <%= user.lastName %> (<%= user.email %>)</div>');

  // Autocomplete
  $('[name=to]').autocomplete({
    url: 'https://trunkclub-ui-takehome.now.sh/search',
    listSelector: '.autocomplete-list',
    entrySelector: '.list-entry',
    entryTemplate: autocompleteListTemplate
  });

  $('[name=cc]').autocomplete({
    url: 'https://trunkclub-ui-takehome.now.sh/search',
    listSelector: '.autocomplete-list',
    entrySelector: '.list-entry',
    entryTemplate: autocompleteListTemplate,
    allowMultipleSelect: true,
    onBeforeSearch: function (input) {
      var emails = input.split(',');
      return emails[emails.length - 1];
    },
    onAfterSelect: function (input, entry) {
      var currentEntries = input.val().split(',').slice(0, -1);
      currentEntries.push(entry.attr('data-value'));
      input.val(currentEntries.join(','));
    }
  });

  // Send email
  $('.sendEmail').on('click', function (event) {
    event.preventDefault();
    $('.error').remove();
    $('strong').remove();

    var message = {
      to: $('[name=to]').val(),
      cc: JSON.stringify($('[name=cc]').val().split(',')),
      subject: $('[name=subject]').val(),
      body: $('[name=body]').val()
    };

    if (message.cc == '[""]') {
      delete message.cc;
    }

    if (!message.to) {
      $('[name=to]').after('<span class="error">"To" is required</span>');
    }

    if (!message.subject) {
      $('[name=subject]').after('<span class="error">"Subject" is required</span>');
    }

    if (!message.body) {
      $('[name=body]').after('<span class="error">"Body" is required</span>');
    }

    if ($('.error').length) {
      return;
    }

    $.ajax({
      url: 'https://trunkclub-ui-takehome.now.sh/submit',
      method: 'POST',
      data: message,
      success: function (data) {
        $('[name=to], [name=cc], [name=subject], [name=body]').val('');
        $('body').append('<strong>Success! Your email has been sent.</strong>');
      },
      error: function (error) {
        if (error.status === 500) {
          $('body').append('<strong>An error occurred. Please try sending your email again.</strong>');
        }
      }
    });
  });
});
