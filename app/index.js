'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var camelCase = require('camel-case');
var capitalize = require('capitalize');
var walk = require('fs-walk').walk;
var fs = require('fs');

var AngularDirectiveGenerator = yeoman.generators.Base.extend({
  initializing: function () {
  // Use angular-directive-boilerplate npm module as template
    this.sourceRoot(path.join(__dirname, '../node_modules/angular-directive-boilerplate/'));
    this.options = {
      author: {
        name: this.user.git.username,
        email: this.user.git.email
      }
    };
  },

  // Ask name of the directive
  askName: function () {
    var done = this.async();

    this.prompt({
      type: 'input',
      name: 'name',
      message: 'What is your directive name?',
      default: 'my-directive'
    }, function (result) {
      var name = result.name.replace(/\ /g, '-');

      this.options.name = {
        dashed: name,
        camel: camelCase(name),
        spaced: capitalize(name.replace(/\-/, '-'))
      };

      done();
    }.bind(this));
  },

  // Ask publisher's GitHub username
  askGithub: function () {
    var done = this.async();

    this.prompt({
      type: 'input',
      name: 'username',
      message: 'What is your GitHub user name?',
      default: 'someuser'
    }, function (result){

      // TDOD: validate user name if it contain illegal chars
      var username = result.username.replace(/\ /g, '');

      this.options.author.githubId = username;
      done();
    }.bind(this))
  },

  writing: {
    dest: function () {
      var root = this.sourceRoot();
      this.destinationRoot(path.join(this.destinationRoot(), this.options.name.dashed));
      var dest = this.destinationRoot();
      var that = this;

      walk(root, function (basedir, filename, stat, next) {
        var relativePath = basedir.replace(root, '');
        var filePath = path.join(basedir, filename);

        // Ignore this repo's README
        if (filename === 'README.md') {
          return next();
        };

        if (stat.isDirectory()) {

          // FIXME: if it's deep directory this won't work
          fs.mkdir(path.join(filename), next);
          return;
        }

        fs.readFile(filePath, function (err, stream){
          if (err) {
            return console.error(err);
          }

          // Replace directive.md with README.md
          if (filename === 'directive.md') {
            filename = 'README.md';
          }

          // Replace src
          else if (filename.indexOf('directive') > -1) {
            filename = filename.replace('directive', that.options.name.dashed);
          }

          var fileString = stream.toString();
          var writeFilePath = path.join(dest, relativePath, filename);

          // Templating
          fileString = fileString.replace(/the-directive/g, that.options.name.dashed);
          fileString = fileString.replace(/theDirective/g, that.options.name.camel);
          fileString = fileString.replace(/the.directive/g,
            that.options.author.githubId + '.' + that.options.name.dashed);
          fileString = fileString.replace(/angular-directive-template/g, that.options.name.dashed);
          fileString = fileString.replace(/directive.js/g, that.options.name.dashed + '.js');
          fileString = fileString.replace(/directive.css/g, that.options.name.dashed + '.css');
          fileString = fileString.replace(/directive.less/g, that.options.name.dashed + '.less');
          fileString = fileString.replace(/directive.html/g, that.options.name.dashed + '.html');
          fileString = fileString.replace(/[t|T]he [d|D]irective/g, that.options.name.spaced);
          fileString = fileString.replace(/Mohsen Azimi <mazimi@apigee.com>/g,
            that.options.author.name + ' <' + that.options.author.email + '>');
          fileString = fileString.replace('Angular Publishable Directive Template', '');


          fs.writeFile(writeFilePath, fileString, next);
        });
      }, function(err) {
        console.error(err);
      });
    }
  },

  end: function () {
    this.installDependencies();
  }
});

module.exports = AngularDirectiveGenerator;
