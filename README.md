# node-mavlink-gen

A powerful source code generator for [node-mavlink](https://www.npmjs.com/package/node-mavlink)-compatible classes. Uses the same code that powers the [mavlink-mappings](https://www.npmjs.com/package/mavlink-mappings) package used by `node-mavlink`.

## Usage

It's really easy to get going!

```
$ npx node-mavlink-gen minimal.xml
```

(You can get the `minimal.xml` file from [here](https://raw.githubusercontent.com/mavlink/mavlink/master/message_definitions/v1.0/minimal.xml))

After you run the command the generator will read all the files you specified in the command line and generate source code for each module.

### Getting a colored output

There is a way to easily get the code syntax highlighted using the [source-highlight](https://www.gnu.org/software/src-highlite/) utility:

```
$ npx node-mavlink-gen minimal.xml | source-highlight -s javascript -f esc256 | less -r
```
