import { Link } from 'react-router'

export default function NotFoundView() {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
			}}>
			<h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
			<h2 style={{ margin: '1rem 0' }}>Page not found</h2>
			<Link
				to='/'
				style={{
					marginTop: '2rem',
					padding: '0.75rem 1.5rem',
					background: 'rgb(131, 195, 195)',
					color: '#333',
					borderRadius: '0.5rem',
					textDecoration: 'none',
					fontWeight: 500,
					fontSize: '1.1rem',
				}}>
				Return to Home
			</Link>
		</div>
	)
}
