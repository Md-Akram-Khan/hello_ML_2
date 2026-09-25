from pathlib import Path
import sys

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from rough import train_model


ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = Path(__file__).resolve().parent / "parameters.npz"


def main():
    parameters, classes, num_px = train_model(num_iterations=2500, print_cost=False)
    np.savez(
        MODEL_PATH,
        **parameters,
        classes=classes,
        num_px=np.array(num_px),
    )
    print(f"Saved trained model to {MODEL_PATH}")


if __name__ == "__main__":
    main()