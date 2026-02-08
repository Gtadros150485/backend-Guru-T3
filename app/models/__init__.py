# app/models/__init__.py
import os
import importlib
from pathlib import Path
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
model_names = ['Base']

# Get all .py files in this directory
current_dir = Path(__file__).parent
for py_file in current_dir.glob("*.py"):
    if py_file.name.startswith("__") or py_file.name == "__init__.py":
        continue

    module_name = py_file.stem  # Get filename without .py

    try:
        # Import the module
        module = importlib.import_module(f".{module_name}", package="app.models")

        # Find classes that inherit from Base
        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if (isinstance(attr, type) and  # It's a class
                    attr is not Base and  # Not Base itself
                    Base in getattr(attr, '__bases__', [])):  # Inherits from Base

                # Make it available at package level
                globals()[attr_name] = attr
                model_names.append(attr_name)
                print(f"Auto-imported: {attr_name}")

    except ImportError as e:
        print(f"Could not import {module_name}: {e}")

__all__ = model_names