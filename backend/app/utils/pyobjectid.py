from bson import ObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema
from typing import Any

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        """
        Return a Pydantic CoreSchema that defines how to validate and serialize this type.
        """
        # Define a validation function that checks if the input is a valid ObjectId
        def validate(v: Any) -> ObjectId:
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId")
            return ObjectId(v)

        # Define how to handle different input types
        from_input_schema = core_schema.chain_schema(
            [
                # Try to validate from a string
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(validate),
            ]
        )

        return core_schema.json_or_python_schema(
            # How to deserialize from JSON
            json_schema=from_input_schema,
            # How to validate from Python
            python_schema=core_schema.union_schema(
                [
                    # Allow instances of ObjectId directly
                    core_schema.is_instance_schema(ObjectId),
                    # Also allow strings that can be converted
                    from_input_schema,
                ]
            ),
            # How to serialize to JSON
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda instance: str(instance)
            ),
        )

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        """
        Return a JSON schema representation of this type.
        """
        # For JSON schema, we represent ObjectId as a string.
        json_schema = handler(core_schema)
        json_schema.update(
            type='string',
            example='5eb7cf5a86d9755df3a6c593',
        )
        return json_schema

        return handler(source)

