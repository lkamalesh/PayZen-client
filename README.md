# PaymentAI Client

Production-ready merchant operations dashboard built with React 18 + TypeScript + Vite.

## Live Host

- https://payzen-ai.vercel.app

## Stack

- React 18 + TypeScript (strict)
- Vite + React Router
- TanStack Query + Axios
- React Hook Form + Zod
- MUI for UI components
- Recharts for analytics visualization
- Vitest + Testing Library

## Features

- Auth flow
	- Register merchant via `/api/Auth/Register`
	- Login via `/api/Auth` and store JWT token
	- Persist `merchantId` and `apiKey` in local storage
- Dashboard
	- Transaction and flagged metrics
	- Rules coverage summary
	- Status and risk charts
- Payment creation
	- Strong validation with Zod
	- Per-submit generated `Idempotency-Key`
	- Response card with status and risk badge
- Transactions monitoring
	- Search + status filters
	- Client-side pagination
	- Per-row AI explanation drawer using `/api/AI/{transactionId}`
- Risk rules management
	- CRUD forms and table
	- Optimistic cache updates after mutation
- Audit logs page
- Merchant management page
- Shared UX
	- Loading / empty / error states
	- Reusable data table and confirmation dialog
	- Toast notifications
	- Protected/public route guards
	- Error boundary

## Project Structure

```text
src/
	app/
		App.tsx
		providers.tsx
		router.tsx
		theme.ts
	api/
		aiApi.ts
		auditApi.ts
		authApi.ts
		client.ts
		httpError.ts
		merchantApi.ts
		paymentApi.ts
		queryClient.ts
		queryKeys.ts
		ruleApi.ts
		transactionApi.ts
	features/
		auth/
			context/
			pages/
			schemas/
		dashboard/pages/
		payments/
			pages/
			schemas/
		transactions/
			components/
			pages/
		rules/
			components/
			pages/
			schemas/
		audit/pages/
		merchants/pages/
	hooks/
		useToast.tsx
	shared/
		components/
			data/
			errors/
			feedback/
			layout/
			navigation/
			states/
		constants/
		utils/
	test/
		renderWithProviders.tsx
		setup.ts
	types/
```

## Environment Variables

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=https://payzen-api-h5fkashsbzeecjhq.southeastasia-01.azurewebsites.net
```

## API Behavior Handling

- Handles both `token` and `Token` login response fields.
- Supports enum values as numeric or string values using normalizers.
- Sends auth token and API key automatically through Axios interceptors.
- Generates a new `Idempotency-Key` for each payment creation request.

## Scripts

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

## Testing Coverage

- API layer unit test for auth token response variants
- Zod validation unit tests for payment schema
- Basic component tests for login and payment creation pages

## Notes

- Current production build is successful.
- Bundle size warning is expected due dashboard/chart + MUI payload; lazy route splitting can reduce initial bundle size if needed.
