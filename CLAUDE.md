# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands
- Start application: `npm run start:dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Frontend tests: `npm run test`
- Backend tests: `npm run test:api`
- Run single backend test: `jest --config=backend/jest.config.js backend/tests/product.test.js`
- Run single frontend test: `ng test --include=**/cart.service.spec.ts`
- E2E tests: `npm run e2e`

## Code Style Guidelines
- Indentation: 2 spaces
- Quote style: Single quotes in TypeScript ('example')
- TypeScript interfaces for data models with strict typing
- Angular component structure: One file each for HTML, SCSS, TS, and spec
- Error handling: Use RxJS catchError for HTTP requests
- Naming: camelCase for variables/methods, PascalCase for classes/interfaces
- Backend tests: Use Jest with supertest for API testing
- Frontend tests: Angular TestBed pattern with Jasmine
- File naming convention: dash-case for component files