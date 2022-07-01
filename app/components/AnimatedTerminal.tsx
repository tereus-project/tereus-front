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
