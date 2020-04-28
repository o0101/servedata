# Selections

A selection gets data from a number of tables, and displays it into a single view.

A selection module exports two functions,

One named `select`, and one named `display`,

with the following signatures:

`select({selection, id})` returning a WrappedSelection

and:

`display({selection, id, data})` returning a HTMLView

## Selection as a Concept

The `id` parameter is not an 'id' of any particular 'selection' object in the DB. 

The 'selection' is not a table.

The 'id' is just relevant in the context. 

For a 'Profile' selection, 'id' might be the user id of the user profile to show.

In general, the 'id' is a 'abstract primary key' that uniquely identifies a particular selection.

In practice this could be a combination of primary keys for different tables from which to fetch the data.

For example, say a selection required, data from tables: Users, Billing Account, and Usage, the 'id' might look like:

{
  id: 'users/dckjh3f:billingaccounts/fkriu347f:usage/fh3897gfd'
  /* ... */
}

Because each selection module implements its own 'select' and 'display' functions the structure of keys given in the id paramters, 
and their parsing and usage, is left to authors to decide.


