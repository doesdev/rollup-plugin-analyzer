### Contributing code
- fork
- create (feature / fix) branch in your fork
- add tests
- use `js standard` code style
- open pull request

### Notes
Tests are written against several Rollup versions. As such you must use Yarn to manage / install deps. 
Also when adding tests be aware that they are run in a loop of each of the tested Rollup versions. 
Of course there have been some API changes in Rollup over time so you may need to make adjustments 
when testing agsinst one version versus another. As an example you'll notice the tree-shaking tests 
are limited to versions 0.60.x and up.
