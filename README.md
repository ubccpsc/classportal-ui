# ClassPortal

ClassPortal is a web-based system for managing GitHub based courses (both public GitHub and Enterprise GitHub). ClassPortal integrates heaviy with AutoTest, an automated test runner that can be used to provide feedback to students about their assignments.

Student features:

* Viewing Grades
* Forming Teams

Course staff features:

* AutoTest Dashboard (for viewing whole class performance in realtime)
* Posting Grades (so students can see them)
* Defining deliverables
* Disbanding teams & manual team formation
* GitHub support (creating projects for teams)

ClassPortal is a simple lightweight course management system. In contrast, AutoTest is a fairly complex system requiring more course staff intervention. Considering AutoTest's limitations can greatly simplify course administration: understanding these is highly recommended.

## Development Notes

ClassPortal based on Onsen UI.

### To launch

Open two tabs:

1. `webpack --watch` This will recompile the code on every change.
2. `sudo node run` Just do a hard page refresh to reload.

### To develop

* `yarn install`
* Edit `.ts` and `.html` files.
* Follow launch instructions above.

#### Notes

* App structure based on: https://github.com/frandiox/OnsenUI-Todo-App

* Onsen API: https://onsen.io/v2/api/js/

* Onsen CSS: https://onsen.io/v2/api/css.html 

