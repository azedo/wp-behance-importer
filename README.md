# WP Behance Importer

> Just an easier way to import your existing projects on Behance to your wordpress portfolio.
  
__Version 0.4b__  
__License MIT__  
__Author [Eduardo Grigolo](http://www.eduardogrigolo.com.br)__


## Description

This plugin is ment to help people that want to post their projects in Behance, but also want to keep their personal portfolio/website updated.

Is fairly simple to get started, all you need is a developer key from behance (wich you can grab yours [here](http://www.behance.com/dev)) and your behance profile link (usually __http://www.behance.net/YOUR_NAME__).

After the configuration, is just a matter of making a search based on the first project ever posted on behance, from an specific date or from today (the day your are using the plugin of course!).

Then you need to select the projects you want to import e voi-lá! After a few seconds (or minutes, depending on how many you want to import) you'll have your projects in your wordpress site/portfolio awaiting to be published!



### TODO
2. ~~Make the selection "click" move from just the checkmark, to the entire line of the project soon to be imported~~
3. ~~Select wich post type is going to receive the imported projects~~
4. Select wich is the post field for the images imported
5. ~~Fix the selected tab css (it's showing a line under the tabs name)~~
6. ~~Tranfer the text from the js file to the php in order to translate them~~
7. ~~Add an option to choose the custom post type of the portfolio~~
8. Save the project id on db in order to tell the user wich projects were added already
9. Make a "lock" for the settings fields, so the user doesn't change the values by mistake
10. Add a button to clear the selected projects
11. Create better css classes and ids of the divs in the admin area to avoid conflict with other plugins


### Roadmap
- Save the json in the db as well
- Add a progress bar for better showing of the import progress
- Better handling of the Responses and Erro codes (200 / 403 / 404 / 429 / 500 / 503)
- Make a search field to search projects by name or tag
- Give the user an option to import not just images
- Finish the Help section
- Make the plugin create the custom post type if the user wants to
- Give the option for the user to choose what kind of content he/she whishes to import to the site (text / embed / image / video / audio)
- Give the option to import the comments made in behance
- Give the option to import the views / appreciations / fields / tags
- Give the option to convert imported tags / fields into post taxonomies (category or tag)
- Pagination for the results