# Helper Library
Helper library is usually for supporting of the Do Not Repeat Yourself  Principal (DRY).  When we write code and find ourselves doing a lot of copy and paste, it is best to just refactor the code into something that is re-usable.  Since we do not know where to put these codes and do not want to get into over-engineering battle, it is common to simply make helper library out of them.  We can always go back to refactor them into their own project at a later time.

# The Design

## s3 storage
A strategy is needed to use s3 as a database storage.  In order to support hierarchical storage, we will use the following directory structure:

```
projects/!project-guid1*project-name-slug.name
projects/!project-guid2*project-name-slug.name
tasks/project-guid1/!task-guid1*task-name-slug.name
tasks/project-guid1/!task-guid2*task-name-slug.name
```

* data will be stored as !item-guid!item-name-slug.name - this allow for changing of item name without having to change item guid.  Prefixing with '!' allow for sorting of all item names to the top.
* Why a Guid? Why can't we just use name? To answer, we need to think about what happen when item needed to be rename.  Guid help to update item name without having to rename all other related items.
* List all Projects:
```
aws s3api list-objects-v2 --bucket bucketName --prefix projects/!
```
* List all Project's Tasks:
```
aws s3api list-objects-v2 --bucket bucketName
--prefix tasks/project-guid/!
```
* One advantage of having 'tasks/' folder separately is to have longer task name, since certain/legacy s3 region has a max filename limit of 255 characters.  Another benefit is the ability to group tasks together so one can simply add a s3 trigger on prefix 'tasks/' and '.name' for post edit processing, such as search indexing.
* Since we already prefix '!' to help with items listing, items inside of projects folder no longer show up during listing.  We can have individual project guid subfolder to store related data.
```
projects/project-guid/users.json
projects/project-guid/teams.json
```
