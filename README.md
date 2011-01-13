## Bomberman

This is my own clone of Bomberman.
For now only with game logic.

Will not use node.js specific code on this game logic lib, as it will also run client side.
Will not use namespaces since this is not really a library but my own code, and it will not extend out.
  
### Files

 * <b>src</b>: Source files
 * <b>spec</b>: Spec files, main tests
 * <b>lib</b>: Libraries for testing and building
   * <b>compiler.jar</b>: Google Closure Compiler for compiling
   * <b>jslint4java-1.4.6.jar</b>: Java version of JSLint, for checking the source
 * <b>dist</b>: Built and ready to use files
   * <b>bomberman.js</b>: Bundled version of the source, readable
   * <b>bomberman.min.js</b>: Compiled version (Google Closure Compiler)
 * <b>Makefile</b>: Testing and pulling dependent test framework
 * <b>SpecRunner.html</b>: For testing in browser
 * <b>SpecRunnerDist.html</b>: For testing dist file (dist/bomberman.min.js) in browser

### Testing

To test the project you must do the following:
 
 * Run:
       make update 
   to fetch dependecies
 * Open SpecRunner.html in a browser
