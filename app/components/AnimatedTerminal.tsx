import { Box, Card, Group, Transition } from "@mantine/core";
import { useInterval } from "@mantine/hooks";
import { Prism } from "@mantine/prism";
import type { Language } from "prism-react-renderer";
import { useEffect, useState } from "react";
import { ArrowRight } from "tabler-icons-react";

// @ts-ignore
import PrismRenderer from "prism-react-renderer/prism";

// @ts-ignore
(typeof global !== "undefined" ? global : window).Prism = PrismRenderer;
require("prismjs/components/prism-lua");

interface Variant {
  sourceLanguage: Language | string;
  sourceCode: string;

  targetLanguage: Language | string;
  targetCode: string;
}

const VARIANTS: Variant[] = [
  {
    sourceLanguage: "c",
    sourceCode: `
  #include <stdio.h>

  int main() {
    printf("Hello, World!");
    return 0;
  }
  `.trim(),
    targetLanguage: "go",
    targetCode: `
  package main

  import (
  	"fmt"
  	"os"
  )

  func main() {
  	fmt.Printf("Hello, World!")
  	os.Exit(0)
  }
  `.trim(),
  },
  {
    sourceLanguage: "c",
    sourceCode: `
  #include <stdio.h>

  int fib(int n)
  {
      if (n <= 1)
          return n;
      return fib(n - 1) + fib(n - 2);
  }
  `.trim(),
    targetLanguage: "go",
    targetCode: `
  package main

  func fib(n int) int {
  	if n <= 1 {
  		return n
  	}
  	return fib(n-1) + fib(n-2)
  }
  `.trim(),
  },
  {
    sourceLanguage: "c",
    sourceCode: `
double Pow(double x, int n) {
  double sum = 1.0;

  int sign = n < 0 ? -1 : 1;
  unsigned int nn = (unsigned int) n * sign;

  while (nn) {
    if (nn & 1) {
      sum *= x;
    }
    nn >>= 1;
    x *= x;
  }

  return sign == 1 ? sum : 1.0 / sum;
}
`.trim(),
    targetLanguage: "go",
    targetCode: `
package main

import "github.com/tereus-project/tereus-transpiler-c-go/libc"

func Pow(x float64, n int) float64 {
  sum := float64(1.0)
  sign := libc.Ternary(n < 0, func() int { return -1 }, func() int { return 1 })
  nn := uint(n) * uint(sign)

  for nn {
    if nn & uint(1) {
      sum *= x
    }
    nn >>= uint(1)
    x *= x
  }
  return libc.Ternary(sign == 1, func() float64 { return sum }, func() float32 { return 1.0 / float32(sum) })
}
`.trim(),
  },
  {
    sourceLanguage: "c",
    sourceCode: `
#include <stdio.h>

void swap(int* n1, int* n2)
{
    int temp;
    temp = *n1;
    *n1 = *n2;
    *n2 = temp;
}

int main()
{
    int num1 = 5, num2 = 10;
    swap( &num1, &num2);
    printf("num1 = %d\n", num1);
    printf("num2 = %d", num2);
    return 0;
}
`.trim(),
    targetLanguage: "go",
    targetCode: `
package main

import (
	"fmt"
	"os"
)

func swap(n1 *int, n2 *int) {
	temp := 0
	temp = *n1
	*n1 = *n2
	*n2 = temp
}

func main() {
	num1, num2 := 5, 10
	swap(&num1, &num2)
	fmt.Printf("num1 = %d\n", num1)
	fmt.Printf("num2 = %d", num2)
	os.Exit(0)
}
`.trim(),
  },
];

export interface AnimatedTerminalProps {}

export function AnimatedTerminal(props: AnimatedTerminalProps) {
  const [currentVariant, setCurrentVariant] = useState(0);

  const next = () => {
    setCurrentVariant((currentVariant) => (currentVariant + 1) % VARIANTS.length);
  };

  const interval = useInterval(() => next(), 5000);

  useEffect(() => {
    interval.start();
    return interval.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Box
        sx={{
          position: "relative",
          display: "flex",
        }}
      >
        {VARIANTS.map((variant, i) => (
          <Transition
            key={i.toString()}
            mounted={i == currentVariant}
            transition={i == currentVariant ? "slide-left" : "slide-right"}
            duration={400}
            timingFunction="ease"
          >
            {(styles) => (
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                }}
              >
                <Box style={styles}>
                  <Group position="center">
                    <Card shadow="sm" withBorder sx={{ flex: 1 }}>
                      <Prism withLineNumbers language={variant.sourceLanguage as any}>
                        {variant.sourceCode}
                      </Prism>
                    </Card>

                    <ArrowRight />

                    <Card shadow="sm" withBorder sx={{ flex: 1 }}>
                      <Prism withLineNumbers language={variant.targetLanguage as any}>
                        {variant.targetCode}
                      </Prism>
                    </Card>
                  </Group>
                </Box>
              </Box>
            )}
          </Transition>
        ))}
      </Box>
    </>
  );
}
