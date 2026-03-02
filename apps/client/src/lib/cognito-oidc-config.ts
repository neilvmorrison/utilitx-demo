const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? ''
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? ''
const region = process.env.NEXT_PUBLIC_COGNITO_REGION ?? ''
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const cognitoAuthConfig = {
	authority: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
	client_id: clientId,
	redirect_uri: `${appUrl}/auth/callback`,
	response_type: 'code' as const,
	scope: 'email openid phone',
}
