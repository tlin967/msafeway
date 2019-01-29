# mSafeway

## Setup Instructions

1. Installing node modules
   Run `npm install`

2. Setting/Resetting mysql tables
   Open cmd/terminal

   - If you have added mysql to your environment path variable,
     - run `mysql -u root -p`
     - run `source <desired sql file>;` to build/reset relevant tables

   - if you do not have mysql added to your environment path variable,

     - go to mysql exe location

     - launch mysql

     - run `source <Y>;` where Y is the absolute file path to the desired sql file (

       eg: Y is C:/Users/Emily/Documents/MySQLpractice/X.sql
       run `source "C:/Users/Emily/Documents/MySQLpractice/X.sql";`)

3. Exit mysql terminal or use new cmd/terminal

4. Run `node select.js`

5. Access `localhost:8080` in browser. Make sure scripts are allowed!

