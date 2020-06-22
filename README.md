# ServeData 

**Around 3000 source lines of code** (see stats folder)

## Version 1.4.0

A simple server based on [stubdb](https://github.com/cris691/stubdb) for serving all types of data, while attempting to meet [ROCA](https://roca-style.org/) guidelines.

Already includes schemas and users, and groups, and authentication, and authorization and permissions. 


## Using this template

You need to populate the secrets directory, with a G Suite/GMail API key with sender permissions, and (if you want fun error pages), a Giphy API key.

Also right now there's some places in the templates where I used my email (cris@dosycorp.com), so you probably want to replace that.


## Use cases

This uses stbudb as a database. This would be acceptable for user account related use cases for a moderate number of users (up to 100k), or for user content and data related use cases for a smaller number of less frequent users (up to 5k). Mitigations such as vertical scaling, and using a ramdisk (with scheduled saves to hard disk) can increase performance.

For apps with a large number of users performing many operations on data and content, a separate database for content and data (separate to user account data) will be good.
