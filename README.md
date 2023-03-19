# icedb
I just made a vocabulary analyzer and a query sentence because I was bored.

## Pre-Run Settings

use `npm`

```
$ npm install
```

## Usage

import module `icedb`

```js
const { icedb } = require(`./icedb/index.js`);
```

`icedb.setPath()` determines where to store the data.

```js
icedb.setPath(`./data`);
```

`Icedb.createDatabase()` creates a database (json file).

```js
icedb.createDatabase(`test`);
```

`Icedb.createTable()` creates a table.

```js
icedb.createTable(`test`, { tablename: `users` });
```

`Icedb.addItem()` creates a item in table.

```js
icedb.addItem(`test`, {
  tablename: `users`,
  data: {
    id: 1,
    name: `admin`
    email: `ice1github@gmail.com`
  }
});
```

`Icedb.query()` analyzes vocabulary and allows you to use the functions listed above.
```js
icedb.query(`
# set path
SET PATH './data';

# create database test
CREATE DATABASE 'test';

# create table users, repo
CREATE TABLE 'test' => 'users';
CREATE TABLE 'test' => 'repo';

# create item
CREATE ITEM 'test' => 'users' => '{"id":1,"name":"test1"}';
CREATE ITEM 'test' => 'users' => '{"id":2,"name":"test2"}';

CREATE ITEM 'test' => 'repo' => '{"id":1,"full_name":"testrepo1"}';
CREATE ITEM 'test' => 'repo' => '{"id":2,"full_name":"testrepo2"}';
CREATE ITEM 'test' => 'repo' => '{"id":3,"full_name":"testrepo3"}';

# delete item (idx: 0) in repo
DELETE ITEM 'test' => 'repo' => 0;
`);

console.log(icedb.query(`GET ITEM 'test' => 'repo' => 2;`));
```
