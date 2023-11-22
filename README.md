# js-mapper-object
Convert and map an object into a new object with custom keys
### Install
```
npm install js-mapper-object
```
or
```
yarn add js-mapper-object
```
### Usage
```
import { Mapper } from 'js-mapper-object'

interface OriginalObjectTypes {
    firstName: string
    lastName: string
    birthdate: Date
    address: {
        city: string
        street: string
        zipcode: string
    }
}

const orignalObject: OriginalObjectTypes =  {
    firstName: 'John',
    lastName: 'Doe',
    birthdate: new Date('1989-07-21'),
    address: {
        city: 'Toronto',
        street: 'Ajax Block street',
        zipcode: '123456'
    }
}

interface NewObjectTypes {
    legalName: string
    fullName: string
    dateOfBirth: string
    fullAddress: string
}

const newObject = new Mapper<OriginalObjectTypes, NewObjectTypes>(originalObject)
    .map('firstName', 'legalName')
    .mapJoin([
        'firstName',
        'lastName'
    ], 'fullName')
    .map('birthdate', {
        'dateOfBirth': (value: Date) => value.toDateString()
    })
    .mapJoin([
        'address.street',
        'address.zipcode',
        'address.city',
    ], {
        'full.address': (value: string) => value
    }, ',')
    .map('address.street', 'street.name')
    .map('address.street', 'street')
    .map('address.zipcode', {'zip': (value: string) => value})
    .destinationObj
   
// newObject
{
  legalName: 'John',
  fullName: 'John Doe',
  dateOfBirth: 'Fri Jul 21 1989',
  full: { address: 'Ajax Block street,123456,Toronto' },
  street: 'Ajax Block street',
  zip: '123456'
}
```