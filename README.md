# App

Gympass style app.

## Functional Requirement

- [] It should be possible to sign-up an user;
- [] It should be possible to authenticate an user;
- [] It should be possible to obtain logged user profile;
- [] It should be possible to obtain the number of check-ins made by logged user;
- [] It should be possible to user retrive their check-in history;
- [] It should be possible for user to search for nearby gyms;
- [] It should be possible for user to search for gyms by name;
- [] It should be possible for user made check-in in a gym;
- [] It should be possible to register a gym;

## Business Rules

- [] It shouldn't be possible to register with a duplicated email;
- [] It shouldn't be possible to make more than ONE check-in per day;
- [] It shouldn't be possible for a user to make a check-in if they are not within 100 meters of the gym;
- [] A check-in should only be valid within 20 minutes after it has been created;
- [] A check-in should only be validated by administrators;
- [] A gym should only be registered by administrators;

## Nonfunctional Requirements

- [] User passwords should be encrypted;
- [] The application data should be persisted inside a PostgreSQL database;
- [] All data lists should be paginated with 20 items per page;
- [] User should be identified by a JWT(JSON Web Token);
