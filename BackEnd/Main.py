from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mpmath as mp

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hardcoded symbolic expressions for small odd zeta
special_cases = {
    3: r"ζ(3) = \frac{\pi^2}{7} - \frac{1}{2}\sum_{k=1}^\infty \frac{\zeta(2k)}{k 2^{2k}}",
    5: r"ζ(5) = \frac{\pi^4}{90} - \frac{\pi^2}{12}\zeta(3) + \frac{1}{2}\sum_{k=1}^\infty \frac{\zeta(2k)}{k(k+2)2^{2k}}",
    7: r"ζ(7) = \frac{\pi^6}{945} - \frac{\pi^4}{72}\zeta(3) + \frac{\pi^2}{24}\zeta(5) - \frac{1}{2}\sum_{k=1}^\infty \frac{\zeta(2k)}{k(k+3)2^{2k}}",
}

@app.get("/zeta/{n}")


def zeta_odd_advanced(n, N=1000):

    mp.mp.dps = 80
    s = mp.mpf('0')


    for k in range(1, N):
        s += 1 / mp.power(k, n)


    correction = (
        (1 / ((n - 1) * mp.power(N, n - 1))) +
        (1 / (2 * mp.power(N, n))) +
        (n / (12 * mp.power(N, n + 1)))
    )

    # Recursion (symbolic if available, else general template)
    if n in special_cases:
        recursion = special_cases[n]
    else:
        m = (n - 1) // 2
        recursion = (
            rf"ζ({n}) follows the general recursion form: "
            rf"ζ(2m+1) = c₀ + \sum_{{k=1}}^m c_k ζ(2k), with m={m}."
        )

    return {
        "n": n,
        "series_value": str(approx),
        "recursion": recursion
    }

def zeta_analytic(odd_n, K=50):

    if odd_n % 2 == 0:
        raise ValueError("Input harus ganjil: 3, 5, 7, ...")
    
    mp.mp.dps = 80
    l = (odd_n - 1) // 2

   
    prefactor = ((-1)**l * 2**(2*l)) / (2**(2*l + 1) - 1)

   
    sigma1 = mp.mpf('0')
    for k in range(1, l):
        coeff = ((-1)**(k-1) * mp.pi**(2*(l-k))) / mp.factorial(2*(l-k))
        sigma1 += coeff * (1 - 1/(2**(2*k))) * mp.zeta(2*k + 1)

 
    term_pi = (mp.pi**2 / mp.factorial(2*l)) * (mp.log(mp.pi) - 1/(2*l))


    sigma2 = mp.mpf('0')
    for k in range(1, K):
        sigma2 += mp.zeta(2*k) / (k * (k + l) * 2**(2*k))


    return prefactor * (sigma1 - term_pi - l * sigma2)
