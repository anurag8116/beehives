# recon

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.5.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Building the docker image

First build the project for the particular environment.

```
npm run build -- --env=$ENV
```

Build the docker image.

```
docker build -t recon-ui:$ENV
```

People using M1 macs need to use this command instead:

```
docker buildx build --platform linux/amd64 -t recon-ui:$ENV
```

## Pushing docker image to ECR

Authenticate docker to push to ECR.

```
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 280853826434.dkr.ecr.ap-south-1.amazonaws.com
```

Tag the docker image.

```
docker tag recon-ui:$ENV 280853826434.dkr.ecr.ap-south-1.amazonaws.com/recon-ui:$ENV-latest
```

Finally, push the image to ECR.

```
docker push docker tag recon-ui:$ENV 280853826434.dkr.ecr.ap-south-1.amazonaws.com/recon-ui:$ENV-latest
```
